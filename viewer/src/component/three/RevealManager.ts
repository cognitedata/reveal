/*!
 * Copyright 2020 Cognite AS
 */

import { Subject, Observable, merge, BehaviorSubject, animationFrameScheduler } from 'rxjs';
import {
  publish,
  filter,
  flatMap,
  auditTime,
  withLatestFrom,
  map,
  share,
  switchAll,
  observeOn,
  scan
} from 'rxjs/operators';
import { loadCadModelByUrl, createLocalPointCloudModel } from '../../datasources/local';
import { loadCadModelFromCdf, createPointCloudModel } from '../../datasources/cognitesdk';
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
import { ModelNodeAppearance } from '../../views/common/cad/ModelNodeAppearance';
import { Sector, SectorQuads } from '../../models/cad/types';
import { File3dFormat } from '../../data/model/File3dFormat';
import { Repository } from '../../repository/cad/Repository';
import { MaterialManager } from '../../views/threejs/cad/MaterialManager';
import { Cad } from '../../data/model/Cad';
import { createThreeJsPointCloudNode } from '../../views/threejs';
import { PotreeGroupWrapper } from '../../views/threejs/pointcloud/PotreeGroupWrapper';
import { PotreeNodeWrapper } from '../../views/threejs/pointcloud/PotreeNodeWrapper';
import { PointCloud } from '../../data/model/PointCloud';

export interface RevealOptions {
  nodeAppearance?: ModelNodeAppearance;
  budget?: CadBudget;
  // internal options are experimental and may change in the future
  internal?: {
    parseCallback?: (parsed: { lod: string; data: Sector | SectorQuads }) => void;
    sectorCuller?: SectorCuller;
  };
}

export type OnDataUpdated = () => void;

export class RevealManager {
  private readonly _sectorRepository: Repository;
  private readonly _modelSubject: Subject<Cad | PointCloud> = new Subject();
  private readonly _loadingHintsSubject: Subject<CadLoadingHints> = new BehaviorSubject({});
  private readonly _cameraSubject: Subject<THREE.PerspectiveCamera>;
  private readonly _modelObservable: Observable<CadNode | [PotreeGroupWrapper, PotreeNodeWrapper]>;
  private readonly _cadObservable: Observable<CadNode[]>;

  private readonly _materialManager: MaterialManager;
  private readonly _cadNodeMap: Map<string, CadNode> = new Map();

  private _sectorCuller: SectorCuller;
  // private _budget: CadBudget;

  constructor(
    client: CogniteClient,
    sectorRepository: Repository,
    materialManager: MaterialManager,
    dataUpdatedCallback: OnDataUpdated,
    options?: RevealOptions
  ) {
    this._sectorCuller = (options && options.internal && options.internal.sectorCuller) || new ProximitySectorCuller();
    // this._budget = (options && options.budget) || createDefaultCadBudget();
    this._sectorRepository = sectorRepository;
    this._materialManager = materialManager;
    this._modelObservable = this._modelSubject.pipe(
      publish(addModelObservable => {
        const cadObservable = addModelObservable.pipe(
          filter((model): model is Cad => model.format === File3dFormat.RevealCadModel),
          flatMap(
            model => {
              if (model.source.discriminator === 'cdf') {
                return loadCadModelFromCdf(client, model.source.modelRevision);
              } else if (model.source.discriminator === 'external') {
                return loadCadModelByUrl(model.source.url);
              } else {
                throw new Error('Unknown Source');
              }
            },
            (model, cadModel) => ({
              ...model,
              data: cadModel
            })
          )
        );
        const pointCloudObservable = addModelObservable.pipe(
          filter((model): model is PointCloud => model.format === File3dFormat.EptPointCloud),
          flatMap(
            model => {
              if (model.source.discriminator === 'cdf') {
                return createPointCloudModel(client, model.source.modelRevision);
              } else if (model.source.discriminator === 'external') {
                return createLocalPointCloudModel(model.source.url);
              } else {
                throw new Error('Unknown Source');
              }
            },
            (model, pointCloudModel) => ({
              ...model,
              data: pointCloudModel
            })
          )
        );
        return merge(
          cadObservable.pipe(
            map(cad => {
              const cadModel = cad.data;
              const node = new CadNode(cadModel, this._materialManager);
              this._materialManager.addModelMaterials(
                cadModel.identifier,
                cadModel.scene.maxTreeIndex,
                cad.modelNodeAppearance
              );
              this._cadNodeMap.set(cadModel.identifier, node);
              cad.callbacks.success(node);
              return node;
            })
          ),
          pointCloudObservable.pipe(
            flatMap(
              pointCloud => createThreeJsPointCloudNode(pointCloud.data),
              (request, wrapper) => {
                request.callbacks.success(wrapper);
                return wrapper;
              }
            )
          )
        );
      })
    );

    const cadNodeArray: CadNode[] = [];
    this._cadObservable = this._modelObservable.pipe(
      filter((model): model is CadNode => model instanceof CadNode),
      scan((accumulator, cadnode) => {
        accumulator.push(cadnode);
        return accumulator;
      }, cadNodeArray)
    );
    this._cameraSubject = this.createLoadSectorsPipeline(dataUpdatedCallback);
  }

  public addModelFromCdf(modelRevision: string | number, modelNodeAppearance?: ModelNodeAppearance): Promise<CadNode> {
    let resolveCb: (cadNode: CadNode) => void | undefined;
    let rejectCb: (message: string) => void | undefined;
    const promise = new Promise<CadNode>((resolve, reject) => {
      resolveCb = resolve;
      rejectCb = reject;
    });
    this._modelSubject.next({
      format: File3dFormat.RevealCadModel,
      source: {
        discriminator: 'cdf',
        modelRevision: this.createModelIdentifier(modelRevision)
      },
      modelNodeAppearance,
      callbacks: { success: resolveCb!, fail: rejectCb! }
    });
    return promise;
  }

  public addModelFromUrl(url: string, modelNodeAppearance?: ModelNodeAppearance): Promise<CadNode> {
    let resolveCb: (cadNode: CadNode) => void | undefined;
    let rejectCb: (message: string) => void | undefined;
    const promise = new Promise<CadNode>((resolve, reject) => {
      resolveCb = resolve;
      rejectCb = reject;
    });
    this._modelSubject.next({
      format: File3dFormat.RevealCadModel,
      source: {
        discriminator: 'external',
        url
      },
      modelNodeAppearance,
      callbacks: { success: resolveCb!, fail: rejectCb! }
    });
    return promise;
  }

  public addPointCloudFromCdf(modelRevision: string | number): Promise<[PotreeGroupWrapper, PotreeNodeWrapper]> {
    let resolveCb: (wrapper: [PotreeGroupWrapper, PotreeNodeWrapper]) => void | undefined;
    let rejectCb: (message: string) => void | undefined;
    const promise = new Promise<[PotreeGroupWrapper, PotreeNodeWrapper]>((resolve, reject) => {
      resolveCb = resolve;
      rejectCb = reject;
    });
    this._modelSubject.next({
      format: File3dFormat.EptPointCloud,
      source: {
        discriminator: 'cdf',
        modelRevision: this.createModelIdentifier(modelRevision)
      },
      callbacks: { success: resolveCb!, fail: rejectCb! }
    });
    return promise;
  }

  public addPointCloudFromUrl(url: string): Promise<[PotreeGroupWrapper, PotreeNodeWrapper]> {
    let resolveCb: (cadNode: [PotreeGroupWrapper, PotreeNodeWrapper]) => void | undefined;
    let rejectCb: (message: string) => void | undefined;
    const promise = new Promise<[PotreeGroupWrapper, PotreeNodeWrapper]>((resolve, reject) => {
      resolveCb = resolve;
      rejectCb = reject;
    });
    this._modelSubject.next({
      format: File3dFormat.EptPointCloud,
      source: {
        discriminator: 'external',
        url
      },
      callbacks: { success: resolveCb!, fail: rejectCb! }
    });
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
        withLatestFrom(this._cadObservable, this._loadingHintsSubject.pipe(share())),
        filter(([_cameraConfig, cadNodes, _loadingHints]) => cadNodes.length > 0),
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
