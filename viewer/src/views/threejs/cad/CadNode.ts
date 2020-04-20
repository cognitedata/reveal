/*!
 * Copyright 2020 Cognite AS
 */

import * as THREE from 'three';
import { Subject, Observable, animationFrameScheduler, merge, empty } from 'rxjs';
import { publish, share, auditTime, switchAll, map, observeOn, scan, filter, flatMap } from 'rxjs/operators';

import { SectorModelTransformation, SectorScene, SectorMetadata } from '../../../models/cad/types';
import { CadLoadingHints } from '../../../models/cad/CadLoadingHints';
import { CadModel } from '../../../models/cad/CadModel';
import { CadRenderHints } from '../../CadRenderHints';
import { suggestCameraConfig } from '../../../utils/cameraUtils';
import { toThreeJsBox3, toThreeVector3, toThreeMatrix4 } from '../utilities';
import { RenderMode } from '../materials';
import { RootSectorNode } from './RootSectorNode';
import { CachedRepository } from '../../../repository/cad/CachedRepository';
import { Repository } from '../../../repository/cad/Repository';
import { NodeAppearance } from '../../common/cad/NodeAppearance';
import { MaterialManager } from './MaterialManager';
import { ConsumedSector } from '../../../data/model/ConsumedSector';
import { fromThreeCameraConfig, ThreeCameraConfig } from './fromThreeCameraConfig';
import { ProximitySectorCuller } from '../../../culling/ProximitySectorCuller';
import { LevelOfDetail } from '../../../data/model/LevelOfDetail';
import { distinctUntilLevelOfDetailChanged } from '../../../models/cad/distinctUntilLevelOfDetailChanged';
import { filterCurrentWantedSectors } from '../../../models/cad/filterCurrentWantedSectors';
import { SectorCuller } from '../../../culling/SectorCuller';
import { DetermineSectorsByProximityInput } from '../../../models/cad/determineSectors';
import { ParsedSector } from '../../../data/model/ParsedSector';
import { WantedSector } from '../../../data/model/WantedSector';
import { CadBudget, createDefaultCadBudget } from '../../../models/cad/CadBudget';
import { discardSector } from './discardSector';
import { CadSectorParser } from '../../../data/parser/CadSectorParser';
import { SimpleAndDetailedToSector3D } from '../../../data/transformer/three/SimpleAndDetailedToSector3D';
import { CDFSource, ExternalSource } from '../../../data/model/DataSource';
import { Reveal3DClientExtension } from '../../../data/provider/http/Reveal3DClientExtension';
import { CogniteClient } from '@cognite/sdk';

export type ParseCallbackDelegate = (sector: ParsedSector) => void;

export interface CadNodeOptions {
  nodeAppearance?: NodeAppearance;
  budget?: CadBudget;
  // internal options are experimental and may change in the future
  internal?: {
    sectorCuller?: SectorCuller<DetermineSectorsByProximityInput>;
  };
}

export interface SuggestedCameraConfig {
  position: THREE.Vector3;
  target: THREE.Vector3;
  near: number;
  far: number;
}

export interface RootSector {
  source: CDFSource | ExternalSource;
  scene: SectorScene;
  boundingBox: THREE.Object3D;
  node: RootSectorNode;
  materialManager: MaterialManager;
  modelTransformation: SectorModelTransformation;
  renderHints: CadRenderHints;
  loadingHints: CadLoadingHints;
}

enum ActionType {
  Add,
  Remove
}

export class CadNode extends THREE.Object3D {
  // public readonly rootSector: RootSectorNode;
  // public readonly modelTransformation: SectorModelTransformation;
  public readonly rootSectors: Map<string, RootSector> = new Map();
  public readonly rootSectorSubject: Subject<{
    type: ActionType;
    dataSource: CDFSource | ExternalSource;
  }> = new Subject();
  public readonly rootSectorObservable: Observable<RootSector[]>;

  private _sectorCuller: SectorCuller<DetermineSectorsByProximityInput>;
  private _renderHints: CadRenderHints;
  private _loadingHints: CadLoadingHints;
  private _budget: CadBudget;

  // private readonly _materialManager: MaterialManager;
  private readonly _cameraPositionObservable: Subject<ThreeCameraConfig>;
  // private readonly _sectorScene: SectorScene;
  private readonly _previousCameraMatrix = new THREE.Matrix4();
  // private readonly _boundingBoxNode: THREE.Object3D;
  private readonly _repository: Repository;

  constructor(client: CogniteClient, options?: CadNodeOptions) {
    super();
    this.type = 'CadNode';
    this.name = 'Sector model';
    // const treeIndexCount = model.scene.maxTreeIndex + 1;
    // this._materialManager = new MaterialManager(treeIndexCount, options ? options.nodeAppearance : undefined);

    // const rootSector = new RootSectorNode(model);

    this.rootSectorObservable = this.rootSectorSubject.pipe(
      publish(actionObservable => {
        const addActionObservable = actionObservable.pipe(
          filter(action => action.type === ActionType.Add),
          flatMap(
            action => {
              // TODO: Create RootSector from Source?
              return empty();
            },
            (action, rootSector) => ({ action: action.type, rootSector })
          )
        );
        const removeActionObservable = actionObservable.pipe(
          filter(action => action.type === ActionType.Remove),
          flatMap(
            action => {
              // TODO: Clean up RootSector
              return empty();
            },
            (action, rootSector) => ({ action: action.type, rootSector })
          )
        );

        return merge(addActionObservable, removeActionObservable);
      }),
      scan((collection, event) => {
        if (event.action === ActionType.Add) {
          collection.push(event.rootSector);
        }
        if (event.action === ActionType.Remove) {
          collection.remove(event.rootSector);
        }
        return collection;
      }, [])
    );

    const revealClient: Reveal3DClientExtension = new Reveal3DClientExtension(client);
    const modelDataParser: CadSectorParser = new CadSectorParser();
    const modelDataTransformer: SimpleAndDetailedToSector3D = new SimpleAndDetailedToSector3D();

    this._repository = new CachedRepository(revealClient, modelDataParser, modelDataTransformer);
    this._budget = (options && options.budget) || createDefaultCadBudget();

    // const { scene, modelTransformation } = model;

    // this._sectorScene = scene;
    this._sectorCuller = (options && options.internal && options.internal.sectorCuller) || new ProximitySectorCuller();
    // this.modelTransformation = modelTransformation;
    // Ensure camera matrix is unequal on first frame
    this._previousCameraMatrix.elements[0] = Infinity;

    // Prepare renderables
    // this.rootSector = rootSector;
    // this.add(rootSector);
    // this._boundingBoxNode = this.createBoundingBoxNode(scene.getAllSectors());
    // this.add(this._boundingBoxNode);

    // Apply default hints
    this._renderHints = {};
    this._loadingHints = {};
    this.renderHints = {};
    this.loadingHints = {};

    /*
    const indices = [];
    for (let i = 0; i < scene.maxTreeIndex; i++) {
      indices.push(i);
    }*/
    // this._materialManager.updateNodes(indices);
    this._cameraPositionObservable = this.createLoadSectorsPipeline();
  }

  async addModelFromCDF(modelId: number): THREE.Object3D {}

  /*
  removeModel() {

  }*/

  async addModelByUrl(url: string): THREE.Object3D {}

  requestNodeUpdate(key: string, treeIndices: number[]) {
    //     this._materialManager.updateNodes(treeIndices);
    this.rootSectors.get(key)!.materialManager.updateNodes(treeIndices);
    this.dispatchEvent({ type: 'update' });
  }

  setRenderMode(key: string, mode: RenderMode) {
    this.rootSectors.get(key)!.materialManager.setRenderMode(mode);
  }

  getRenderMode(key: string) {
    return this.rootSectors.get(key)!.materialManager.getRenderMode();
  }

  get budget() {
    return this._budget;
  }

  set renderHints(hints: Readonly<CadRenderHints>) {
    this._renderHints = hints;
    //this._boundingBoxNode.visible = this.shouldRenderSectorBoundingBoxes;
  }

  get renderHints(): Readonly<CadRenderHints> {
    return this._renderHints;
  }

  setRenderHints(key: string, hints: Readonly<CadRenderHints>) {
    this.rootSectors.get(key)!.renderHints = hints;
  }

  getRenderHints(key: string): Readonly<CadRenderHints> {
    return this.rootSectors.get(key)!.renderHints;
  }

  set loadingHints(hints: Readonly<CadLoadingHints>) {
    this._loadingHints = hints;
  }

  get loadingHints(): Readonly<CadLoadingHints> {
    return this._loadingHints;
  }

  private get shouldRenderSectorBoundingBoxes(): boolean {
    return this._renderHints.showSectorBoundingBoxes || false;
  }

  public update(camera: THREE.PerspectiveCamera): void {
    const cameraConfig: ThreeCameraConfig = {
      camera,
      // modelTransformation: this.modelTransformation,
      // sectorScene: this._sectorScene,
      loadingHints: this.loadingHints
    };
    this._cameraPositionObservable.next(cameraConfig);
  }

  /*
  public suggestCameraConfig(): SuggestedCameraConfig {
    const { position, target, near, far } = suggestCameraConfig(this._sectorScene.root);

    return {
      position: toThreeVector3(new THREE.Vector3(), position, this.modelTransformation),
      target: toThreeVector3(new THREE.Vector3(), target, this.modelTransformation),
      near,
      far
    };
  }*/

  // TODO: j-bjorne 20-04-20 Move to toString utils class with other datasource to string functions.
  private sourceToString(item: { dataSource: ExternalSource | CDFSource }) {
    if (item.dataSource.discriminator === 'cdf') {
      return '' + item.dataSource.modelId;
    } else if (item.dataSource.discriminator === 'external') {
      return '' + item.dataSource.url;
    }
    throw new Error('unknown datasource');
  }

  private createLoadSectorsPipeline(): Subject<ThreeCameraConfig> {
    const pipeline = new Subject<ThreeCameraConfig>();
    pipeline
      .pipe(
        auditTime(100),
        fromThreeCameraConfig(),
        // Determine all wanted sectors
        this._sectorCuller.determineSectors(),
        // Take sectors within budget
        map(wantedSectors => this.budget.filter(wantedSectors, this._sectorScene)),
        // Load sectors from repository
        share(),
        publish((wantedSectors: Observable<WantedSector[]>) =>
          wantedSectors.pipe(
            switchAll(),
            distinctUntilLevelOfDetailChanged(),
            this._repository.loadSector(),
            filterCurrentWantedSectors(wantedSectors)
          )
        ),
        observeOn(animationFrameScheduler)
      ) // Consume sectors
      .subscribe((sector: ConsumedSector) => {
        const sectorNodeParent = this.rootSectors.get(this.sourceToString(sector));
        const sectorNode = sectorNodeParent?.node.sectorNodeMap.get(sector.metadata.id);
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
        this.updateSectorBoundingBoxes(sector);
        this.dispatchEvent({ type: 'update' });
      });
    return pipeline;
  }

  private updateSectorBoundingBoxes(sector: ConsumedSector) {
    throw new Error('Not implemented');
    /*
    this._boundingBoxNode.children.forEach(x => {
      const sectorId = x.userData.sectorId as number;
      if (sectorId !== sector.id) {
        return;
      }
      const boxHelper = x as THREE.Box3Helper;
      boxHelper.visible = sector.levelOfDetail !== LevelOfDetail.Discarded;
    }); */
  }

  private createBoundingBoxNode(key: string, sectors: SectorMetadata[]): THREE.Object3D {
    function sectorDepth(s: SectorMetadata) {
      return s.path.length / 2; // Path are on format 'x/y/z/'
    }
    const maxColorDepth = sectors.reduce((max, s) => Math.max(max, sectorDepth(s)), 0.0);
    const from = new THREE.Color(0xff0000);
    const to = new THREE.Color(0x00ff00);
    const colors = [...Array(maxColorDepth).keys()].map(d => {
      const color = new THREE.Color().copy(from);
      color.lerpHSL(to, d / (maxColorDepth - 1));
      return color;
    });

    const boxesNode = new THREE.Group();
    const sectorNodeParent = this.rootSectors.get(key);
    boxesNode.applyMatrix4(toThreeMatrix4(sectorNodeParent!.modelTransformation.modelMatrix));
    boxesNode.name = 'Bounding boxes (for debugging)';
    sectors.forEach(sector => {
      const bbox = toThreeJsBox3(new THREE.Box3(), sector.bounds);
      const color = colors[sectorDepth(sector)];
      const boxMesh = new THREE.Box3Helper(bbox, color);
      boxMesh.name = `${sector.id}`;
      boxMesh.userData.sectorId = sector.id;
      boxesNode.add(boxMesh);
    });
    return boxesNode;
  }
}
