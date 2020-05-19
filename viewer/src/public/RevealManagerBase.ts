/*!
 * Copyright 2020 Cognite AS
 */

import {
  Subject,
  Observable,
  merge,
  BehaviorSubject,
  animationFrameScheduler,
  OperatorFunction,
  pipe,
  from,
  of
} from 'rxjs';
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
  scan,
  toArray
} from 'rxjs/operators';
import { loadCadModelByUrl, loadCadModelFromCdf, CadModel } from '@/dataModels/cad/internal';
import { createLocalPointCloudModel, createPointCloudModel, PointCloudModel } from '@/dataModels/pointCloud';
import { CogniteClient, IdEither } from '@cognite/sdk';
import { distinctUntilLevelOfDetailChanged } from '@/dataModels/cad/internal/sector/distinctUntilLevelOfDetailChanged';
import { filterCurrentWantedSectors } from '@/dataModels/cad/internal/sector/filterCurrentWantedSectors';
import { discardSector } from '@/dataModels/cad/internal/sector/discardSector';
import { CadLoadingHints } from '@/dataModels/cad/public/CadLoadingHints';
import { CadNode } from '@/dataModels/cad/internal/CadNode';
import { CadBudget } from '@/dataModels/cad/public/CadBudget';
import { ConsumedSector } from '@/dataModels/cad/internal/sector/ConsumedSector';
import { ModelNodeAppearance } from '@/dataModels/cad/internal/ModelNodeAppearance';
import { Sector, SectorQuads } from '@/dataModels/cad/internal/sector/types';
import { File3dFormat } from '@/utilities/File3dFormat';
import { Repository } from '@/dataModels/cad/internal/sector/Repository';
import { MaterialManager } from '@/dataModels/cad/internal/MaterialManager';
import { Cad } from '@/dataModels/cad/internal/Cad';
import { PotreeGroupWrapper } from '@/dataModels/pointCloud/internal/PotreeGroupWrapper';
import { PotreeNodeWrapper } from '@/dataModels/pointCloud/internal/PotreeNodeWrapper';
import { PointCloud } from '@/dataModels/pointCloud/internal/PointCloud';
import { SectorCuller } from '@/dataModels/cad/internal/sector/culling/SectorCuller';
import { WantedSector } from '@/dataModels/cad/internal/sector/WantedSector';
import { ByVisibilityGpuSectorCuller } from '@/dataModels/cad/internal/sector/culling/ByVisibilityGpuSectorCuller';
import { isCad, isPointCloud } from '@/utilities/dataTypeFilters';
import { CdfSource } from '@/utilities/networking/CdfSource';
import { ExternalSource } from '@/utilities/networking/ExternalSource';
import { PromiseCallbacks } from '@/utilities/PromiseCallbacks';
import { createThreeJsPointCloudNode } from '@/dataModels/pointCloud/internal/createThreeJsPointCloudNode';

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

export class RevealManagerBase {
  protected readonly _materialManager: MaterialManager;
  private readonly _sectorRepository: Repository;
  private readonly _modelSubject: Subject<Cad | PointCloud> = new Subject();
  private readonly _loadingHintsSubject: Subject<CadLoadingHints> = new BehaviorSubject({});
  private readonly _cameraSubject: Subject<THREE.PerspectiveCamera>;
  private readonly _modelObservable: Observable<CadNode | [PotreeGroupWrapper, PotreeNodeWrapper]>;
  private readonly _cadNodeObservable: Observable<CadNode[]>;

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
    this._sectorCuller =
      (options && options.internal && options.internal.sectorCuller) || new ByVisibilityGpuSectorCuller();
    // this._budget = (options && options.budget) || createDefaultCadBudget();
    this._sectorRepository = sectorRepository;
    this._materialManager = materialManager;
    this._modelObservable = this._modelSubject.pipe(this.addCadOrPointcloudModel(client));
    this._cadNodeObservable = this._modelObservable.pipe(this.getAddedModels());
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

  private addCadOrPointcloudModel(
    client: CogniteClient
  ): OperatorFunction<Cad | PointCloud, CadNode | [PotreeGroupWrapper, PotreeNodeWrapper]> {
    return publish(addModelObservable => {
      const cadObservable = addModelObservable.pipe(isCad(), this.loadCadModelFromCdfOrUrl(client));
      const pointCloudObservable = addModelObservable.pipe(
        isPointCloud(),
        this.loadPointCloudModelFromCdfOrUrl(client)
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
    });
  }

  private loadCadModelFromCdfOrUrl(
    client: CogniteClient
  ): OperatorFunction<
    Cad,
    {
      source: CdfSource | ExternalSource;
      format: File3dFormat.RevealCadModel;
      modelNodeAppearance?: ModelNodeAppearance | undefined;
      data: CadModel;
      callbacks: PromiseCallbacks<CadNode>;
    }
  > {
    return flatMap(
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
    );
  }

  private loadPointCloudModelFromCdfOrUrl(
    client: CogniteClient
  ): OperatorFunction<
    PointCloud,
    {
      data: PointCloudModel;
      format: File3dFormat.EptPointCloud;
      source: CdfSource | ExternalSource;
      callbacks: PromiseCallbacks<[PotreeGroupWrapper, PotreeNodeWrapper]>;
    }
  > {
    return flatMap(
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
    );
  }

  private getAddedModels(): OperatorFunction<CadNode | [PotreeGroupWrapper, PotreeNodeWrapper], CadNode[]> {
    const cadNodeArray: CadNode[] = [];
    return pipe(
      filter((model): model is CadNode => model instanceof CadNode),
      scan((accumulator, cadnode) => {
        accumulator.push(cadnode);
        return accumulator;
      }, cadNodeArray)
    );
  }

  private createLoadSectorsPipeline(callback: OnDataUpdated): Subject<THREE.PerspectiveCamera> {
    const pipeline = new Subject<THREE.PerspectiveCamera>();
    pipeline
      .pipe(
        auditTime(100),
        map(camera => camera.clone()),
        withLatestFrom(this._cadNodeObservable, this._loadingHintsSubject.pipe(share())),
        filter(([_camera, cadModels, loadingHints]) => cadModels.length > 0 && loadingHints.suspendLoading !== true),
        // TODO j-bjorne 19-05-2020: Currently pulling each update for cadnode array and iterating over it.
        // Look into possibility of making it more push based to for instant react to changes of local loading hints regardless of camera update.
        flatMap(([_camera, cadNodes, loadingHints]) => {
          return of({ _camera, cadNodes, loadingHints }).pipe(
            flatMap(
              input =>
                from(input.cadNodes).pipe(
                  filter(cadNode => cadNode.loadingHints.suspendLoading !== true),
                  map(cadNode => cadNode.cadModel),
                  toArray()
                ),
              (input, cadModels) => ({
                camera: input._camera,
                cadModels,
                loadingHints: input.loadingHints
              })
            )
          );
        }),
        map(({ camera, cadModels, loadingHints }) =>
          this._sectorCuller.determineSectors({ camera, cadModels, loadingHints })
        ),
        // Load sectors from repository
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
