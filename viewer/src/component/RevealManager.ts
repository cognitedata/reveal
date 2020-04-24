/*!
 * Copyright 2020 Cognite AS
 */

import { Subject, Observable, merge, BehaviorSubject, animationFrameScheduler } from 'rxjs';
import { Cdf3dModel } from '../data/model/Cdf3dModel';
import { External3dModel } from '../data/model/External3dModel';
import { CadModel } from '../models/cad/CadModel';
import {
  publish,
  filter,
  flatMap,
  auditTime,
  withLatestFrom,
  map,
  share,
  switchAll,
  toArray,
  observeOn,
  tap
} from 'rxjs/operators';
import { loadCadModelByUrl } from '../datasources/local';
import { loadCadModelFromCdf } from '../datasources/cognitesdk';
import { CogniteClient, IdEither } from '@cognite/sdk';
import { fromThreeCameraConfig } from '../views/threejs/cad/fromThreeCameraConfig';
import { distinctUntilLevelOfDetailChanged } from '../models/cad/distinctUntilLevelOfDetailChanged';
import { filterCurrentWantedSectors } from '../models/cad/filterCurrentWantedSectors';
import { discardSector } from '../views/threejs/cad/discardSector';
import { CadLoadingHints } from '../models/cad/CadLoadingHints';
import { SectorCuller, WantedSector } from '../internal';
import { CadNode } from '../views/threejs/cad/CadNode';
import { ProximitySectorCuller } from '../culling/ProximitySectorCuller';
import { CadBudget, createDefaultCadBudget } from '../models/cad/CadBudget';
import { ConsumedSector } from '../data/model/ConsumedSector';
import { NodeAppearance } from '../views/common/cad/NodeAppearance';
import { Sector, SectorQuads } from '../models/cad/types';
import { CachedRepository } from '../repository/cad/CachedRepository';
import { SimpleAndDetailedToSector3D } from '../data/transformer/three/SimpleAndDetailedToSector3D';
import { CadSectorParser } from '../data/parser/CadSectorParser';
import { File3dFormat } from '../data/model/File3dFormat';

export interface RevealOptions {
  nodeAppearance?: NodeAppearance;
  budget?: CadBudget;
  // internal options are experimental and may change in the future
  internal?: {
    parseCallback?: (parsed: { lod: string; data: Sector | SectorQuads }) => void;
    sectorCuller?: SectorCuller;
  };
}

export interface OnSectorLoaded {
  loaded(cadNode: CadNode): void;
}

export class RevealManager {
  private readonly _sectorRepository: CachedRepository;
  private readonly _modelSubject: Subject<Cdf3dModel | External3dModel> = new Subject();
  private readonly _loadingHintsSubject: Subject<CadLoadingHints> = new BehaviorSubject({});
  private readonly _modelObservable: Observable<CadModel>;
  private readonly _nodeObservable: Observable<CadNode>;
  private readonly _sceneObservable: Observable<CadNode[]>;

  private readonly _sectorRepositoryMap: Map<string, CadNode> = new Map();

  private _sectorCuller: SectorCuller;
  private _budget: CadBudget;

  constructor(client: CogniteClient, onSectorLoadedCallback: OnSectorLoaded, options?: RevealOptions) {
    this._sectorCuller = (options && options.internal && options.internal.sectorCuller) || new ProximitySectorCuller();
    this._budget = (options && options.budget) || createDefaultCadBudget();

    const modelDataParser: CadSectorParser = new CadSectorParser();
    const modelDataTransformer: SimpleAndDetailedToSector3D = new SimpleAndDetailedToSector3D();

    this._sectorRepository = new CachedRepository(modelDataParser, modelDataTransformer);

    this._modelObservable = this._modelSubject.pipe(
      publish(addModelObservable => {
        const externalModelObservable = addModelObservable.pipe(
          filter((model): model is External3dModel => model.discriminator === 'external'),
          flatMap(model => loadCadModelByUrl(model.url))
        );
        const cdfModelObservable = addModelObservable.pipe(
          filter((model): model is Cdf3dModel => model.discriminator === 'cdf-model'),
          flatMap(model => loadCadModelFromCdf(client, model.modelRevision))
        );
        return merge(externalModelObservable, cdfModelObservable);
      })
    );

    this._nodeObservable = this._modelObservable.pipe(
      map(model => {
        const node = new CadNode(model, options);
        this._sectorRepositoryMap.set(model.identifier, node);
        modelDataTransformer.addMaterial(model.identifier, node.materialManager.materials);
        return node;
      }),
      tap(cadNode => {
        onSectorLoadedCallback.loaded(cadNode);
      })
    );
    this._sceneObservable = this._nodeObservable.pipe(toArray());
  }

  public addModelFromCdf(modelRevision: string | number) {
    this._modelSubject.next({
      discriminator: 'cdf-model',
      modelRevision: this.createModelIdentifier(modelRevision),
      format: File3dFormat.RevealCadModel
    });
  }

  public addModelFromUrl(url: string) {
    this._modelSubject.next({ discriminator: 'external', url });
  }

  private createModelIdentifier(id: string | number): IdEither {
    if (typeof id === 'number') {
      return { id };
    }
    return { externalId: id };
  }

  private createLoadSectorsPipeline(): Subject<THREE.PerspectiveCamera> {
    const pipeline = new Subject<THREE.PerspectiveCamera>();
    pipeline
      .pipe(
        auditTime(100),
        fromThreeCameraConfig(),
        withLatestFrom(this._sceneObservable, this._loadingHintsSubject.pipe(share())),
        map(([cameraConfig, cadNodes, loadingHints]) =>
          this._sectorCuller.determineSectors({ cameraConfig, cadNodes, loadingHints })
        ),
        // Take sectors within budget
        map(wantedSectors => this._budget.filter(wantedSectors)),
        // Load sectors from repository
        share(),
        publish((wantedSectors: Observable<WantedSector[]>) =>
          wantedSectors.pipe(
            switchAll(),
            distinctUntilLevelOfDetailChanged(),
            this._sectorRepository.loadSector(),
            filterCurrentWantedSectors(wantedSectors)
          )
        ),
        observeOn(animationFrameScheduler)
      ) // Consume sectors
      .subscribe((sector: ConsumedSector) => {
        const sectorNodeParent = this._sectorRepositoryMap.get(sector.cadModelIdentifier)!.rootSector;
        const sectorNode = sectorNodeParent?.sectorNodeMap.get(sector.metadata.id);
        if (!sectorNode) {
          throw new Error(`Could not find 3D node for sector ${sector.metadata.id} - invalid id?`);
        }
        if (sectorNode.group) {
          sectorNode.group.userData.refCount -= 1;
          if (sectorNode.group.userData.refCount === 0) {
            discardSector(sectorNode.group);
          }
          sectorNode.remove(sectorNode.group);
        }
        if (sector.group) {
          // Is this correct now?
          sectorNode.add(sector.group);
        }
        sectorNode.group = sector.group;
        // this.updateSectorBoundingBoxes(sector);
        // this.dispatchEvent({ type: 'update' });
      });
    return pipeline;
  }
}
