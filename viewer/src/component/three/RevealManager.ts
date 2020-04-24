/*!
 * Copyright 2020 Cognite AS
 */

import { Subject, Observable, merge, BehaviorSubject, animationFrameScheduler } from 'rxjs';
import { Cdf3dModel } from '../../data/model/Cdf3dModel';
import { External3dModel } from '../../data/model/External3dModel';
import { CadModel } from '../../models/cad/CadModel';
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
  observeOn
} from 'rxjs/operators';
import { loadCadModelByUrl } from '../../datasources/local';
import { loadCadModelFromCdf } from '../../datasources/cognitesdk';
import { CogniteClient, IdEither } from '@cognite/sdk';
import { fromThreeCameraConfig } from '../../views/threejs/cad/fromThreeCameraConfig';
import { distinctUntilLevelOfDetailChanged } from '../../models/cad/distinctUntilLevelOfDetailChanged';
import { filterCurrentWantedSectors } from '../../models/cad/filterCurrentWantedSectors';
import { discardSector } from '../../views/threejs/cad/discardSector';
import { CadLoadingHints } from '../../models/cad/CadLoadingHints';
import { SectorCuller, WantedSector } from '../../internal';
import { CadNode } from '../../views/threejs/cad/CadNode';
import { ProximitySectorCuller } from '../../culling/ProximitySectorCuller';
import { CadBudget } from '../../models/cad/CadBudget';
import { ConsumedSector } from '../../data/model/ConsumedSector';
import { NodeAppearance } from '../../views/common/cad/NodeAppearance';
import { Sector, SectorQuads } from '../../models/cad/types';
import { CachedRepository } from '../../repository/cad/CachedRepository';
import { SimpleAndDetailedToSector3D } from '../../data/transformer/three/SimpleAndDetailedToSector3D';
import { CadSectorParser } from '../../data/parser/CadSectorParser';
import { File3dFormat } from '../../data/model/File3dFormat';
import { PromiseCallbacks } from '../../data/model/PromiseCallbacks';

export interface RevealOptions {
  nodeAppearance?: NodeAppearance;
  budget?: CadBudget;
  // internal options are experimental and may change in the future
  internal?: {
    parseCallback?: (parsed: { lod: string; data: Sector | SectorQuads }) => void;
    sectorCuller?: SectorCuller;
  };
}

export type OnDataUpdated = () => void;

export class RevealManager {
  private readonly _sectorRepository: CachedRepository;
  private readonly _modelSubject: Subject<Cdf3dModel | External3dModel> = new Subject();
  private readonly _loadingHintsSubject: Subject<CadLoadingHints> = new BehaviorSubject({});
  private readonly _cameraSubject: Subject<THREE.PerspectiveCamera>;
  private readonly _modelObservable: Observable<{ callbacks: PromiseCallbacks<CadNode>; cadModel: CadModel }>;
  private readonly _nodeObservable: Observable<CadNode>;
  private readonly _sceneObservable: Observable<CadNode[]>;

  private readonly _cadNodeMap: Map<string, CadNode> = new Map();

  private _sectorCuller: SectorCuller;
  // private _budget: CadBudget;

  constructor(client: CogniteClient, dataUpdatedCallback: OnDataUpdated, options?: RevealOptions) {
    this._sectorCuller = (options && options.internal && options.internal.sectorCuller) || new ProximitySectorCuller();
    // this._budget = (options && options.budget) || createDefaultCadBudget();
    const modelDataParser: CadSectorParser = new CadSectorParser();
    const modelDataTransformer: SimpleAndDetailedToSector3D = new SimpleAndDetailedToSector3D();

    this._sectorRepository = new CachedRepository(modelDataParser, modelDataTransformer);
    this._sectorRepository.getParsedData().subscribe(parsedSector => {
      const cadNode = this._cadNodeMap.get(parsedSector.cadModelIdentifier);
      
    });

    this._modelObservable = this._modelSubject.pipe(
      publish(addModelObservable => {
        const externalModelObservable = addModelObservable.pipe(
          filter((model): model is External3dModel => model.discriminator === 'external'),
          flatMap(
            model => loadCadModelByUrl(model.url),
            (model, cadModel) => ({
              callbacks: model.callbacks,
              cadModel
            })
          )
        );
        const cdfModelObservable = addModelObservable.pipe(
          filter((model): model is Cdf3dModel => model.discriminator === 'cdf-model'),
          flatMap(
            model => loadCadModelFromCdf(client, model.modelRevision),
            (model, cadModel) => ({
              callbacks: model.callbacks,
              cadModel
            })
          )
        );
        return merge(externalModelObservable, cdfModelObservable);
      })
    );

    this._nodeObservable = this._modelObservable.pipe(
      map(wrapper => {
        const cadModel = wrapper.cadModel;
        const node = new CadNode(cadModel, options);
        this._cadNodeMap.set(cadModel.identifier, node);
        modelDataTransformer.addMaterial(cadModel.identifier, node.materialManager.materials);
        wrapper.callbacks.success(node);
        return node;
      })
    );
    this._sceneObservable = this._nodeObservable.pipe(toArray());
    this._cameraSubject = this.createLoadSectorsPipeline(dataUpdatedCallback);
  }

  public addModelFromCdf(modelRevision: string | number): Promise<CadNode> {
    let resolveCb: (cadNode: CadNode) => void | undefined;
    let rejectCb: (message: string) => void | undefined;
    const promise = new Promise<CadNode>((resolve, reject) => {
      resolveCb = resolve;
      rejectCb = reject;
    });
    this._modelSubject.next({
      discriminator: 'cdf-model',
      modelRevision: this.createModelIdentifier(modelRevision),
      format: File3dFormat.RevealCadModel,
      callbacks: { success: resolveCb!, fail: rejectCb! }
    });
    return promise;
  }

  public addModelFromUrl(url: string): Promise<CadNode> {
    let resolveCb: (cadNode: CadNode) => void | undefined;
    let rejectCb: (message: string) => void | undefined;
    const promise = new Promise<CadNode>((resolve, reject) => {
      resolveCb = resolve;
      rejectCb = reject;
    });
    this._modelSubject.next({ discriminator: 'external', url, callbacks: { success: resolveCb!, fail: rejectCb! } });
    return promise;
  }

  public update(camera: THREE.PerspectiveCamera) {
    this._cameraSubject.next(camera);
  }

  private createModelIdentifier(id: string | number): IdEither {
    if (typeof id === 'number') {
      return { id };
    }
    return { externalId: id };
  }

  private createLoadSectorsPipeline(callback: OnDataUpdated): Subject<THREE.PerspectiveCamera> {
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
        // map(wantedSectors => this._budget.filter(wantedSectors)), <-- Was removed since it requires scene which wanted sectors don't have
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
        const cadNode = this._cadNodeMap.get(sector.cadModelIdentifier);
        const sectorNodeParent = cadNode!.rootSector;
        const sectorNode = sectorNodeParent!.sectorNodeMap.get(sector.metadata.id);
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
        callback();
      });
    return pipeline;
  }
}
