/*!
 * Copyright 2020 Cognite AS
 */

import * as THREE from 'three';
import { Subject, Observable, animationFrameScheduler } from 'rxjs';
import { publish, share, map, observeOn, tap, filter, mergeAll, debounceTime } from 'rxjs/operators';

import { SectorModelTransformation, SectorMetadata, Sector, SectorQuads } from '../../../models/cad/types';
import { SectorScene } from '../../../models/cad/SectorScene';
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
import { filterCurrentWantedSectors } from '../../../models/cad/filterCurrentWantedSectors';
import { SectorCuller } from '../../../culling/SectorCuller';
import { WantedSector } from '../../../data/model/WantedSector';
import { CadBudget, createDefaultCadBudget } from '../../../models/cad/CadBudget';
import { discardSector } from './discardSector';
import { CadSectorParser } from '../../../data/parser/CadSectorParser';
import { SimpleAndDetailedToSector3D } from '../../../data/transformer/three/SimpleAndDetailedToSector3D';

export type ParseCallbackDelegate = (parsed: { lod: string; data: Sector | SectorQuads }) => void;

export interface CadNodeOptions {
  nodeAppearance?: NodeAppearance;
  budget?: CadBudget;
  // internal options are experimental and may change in the future
  internal?: {
    parseCallback?: ParseCallbackDelegate;
    sectorCuller?: SectorCuller;
  };
}

export interface SuggestedCameraConfig {
  position: THREE.Vector3;
  target: THREE.Vector3;
  near: number;
  far: number;
}

export class CadNode extends THREE.Object3D {
  public readonly rootSector: RootSectorNode;
  public readonly modelTransformation: SectorModelTransformation;

  private _sectorCuller: SectorCuller;
  private _renderHints: CadRenderHints;
  private _loadingHints: CadLoadingHints;
  private _budget: CadBudget;
  private _parseCallback?: ParseCallbackDelegate;

  private readonly _materialManager: MaterialManager;
  private readonly _cameraPositionObservable: Subject<ThreeCameraConfig>;
  private readonly _sectorScene: SectorScene;
  private readonly _previousCameraMatrix = new THREE.Matrix4();
  private readonly _boundingBoxNode: THREE.Object3D;
  private readonly _repository: Repository;

  constructor(model: CadModel, options?: CadNodeOptions) {
    super();
    this.type = 'CadNode';
    this.name = 'Sector model';
    const treeIndexCount = model.scene.maxTreeIndex + 1;
    this._materialManager = new MaterialManager(treeIndexCount, options ? options.nodeAppearance : undefined);

    const rootSector = new RootSectorNode(model);

    const modelDataParser: CadSectorParser = new CadSectorParser();
    const modelDataTransformer: SimpleAndDetailedToSector3D = new SimpleAndDetailedToSector3D(
      this._materialManager.materials
    );

    this._repository = new CachedRepository(model.dataRetriever, modelDataParser, modelDataTransformer);
    this._parseCallback = options && options.internal && options.internal.parseCallback;
    if (this._parseCallback) {
      this._repository.getParsedData().subscribe(parseResult => {
        if (this._parseCallback) {
          this._parseCallback(parseResult);
        }
      });
    }
    this._budget = (options && options.budget) || createDefaultCadBudget();

    const { scene, modelTransformation } = model;

    this._sectorScene = scene;
    this._sectorCuller = (options && options.internal && options.internal.sectorCuller) || new ProximitySectorCuller();
    this.modelTransformation = modelTransformation;
    // Ensure camera matrix is unequal on first frame
    this._previousCameraMatrix.elements[0] = Infinity;

    // Prepare renderables
    this.rootSector = rootSector;
    this.add(rootSector);
    this._boundingBoxNode = this.createBoundingBoxNode(scene.getAllSectors());
    this.add(this._boundingBoxNode);

    // Apply default hints
    this._renderHints = {};
    this._loadingHints = {};
    this.renderHints = {};
    this.loadingHints = {};

    const indices = [];
    for (let i = 0; i < scene.maxTreeIndex; i++) {
      indices.push(i);
    }
    this._materialManager.updateNodes(indices);
    this._cameraPositionObservable = this.createLoadSectorsPipeline();
  }

  requestNodeUpdate(treeIndices: number[]) {
    this._materialManager.updateNodes(treeIndices);
    this.dispatchEvent({ type: 'update' });
  }

  set renderMode(mode: RenderMode) {
    this._materialManager.setRenderMode(mode);
  }

  get renderMode() {
    return this._materialManager.getRenderMode();
  }

  get budget() {
    return this._budget;
  }

  set renderHints(hints: Readonly<CadRenderHints>) {
    this._renderHints = hints;
    this._boundingBoxNode.visible = this.shouldRenderSectorBoundingBoxes;
  }

  get renderHints(): Readonly<CadRenderHints> {
    return this._renderHints;
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
      modelTransformation: this.modelTransformation,
      sectorScene: this._sectorScene,
      loadingHints: this.loadingHints
    };

    if (!this.loadingHints.suspendLoading) {
      this._cameraPositionObservable.next(cameraConfig);
    }
  }

  public suggestCameraConfig(): SuggestedCameraConfig {
    const { position, target, near, far } = suggestCameraConfig(this._sectorScene.root);

    return {
      position: toThreeVector3(new THREE.Vector3(), position, this.modelTransformation),
      target: toThreeVector3(new THREE.Vector3(), target, this.modelTransformation),
      near,
      far
    };
  }

  private createLoadSectorsPipeline(): Subject<ThreeCameraConfig> {
    const currentLevelOfDetail = new Map<number, LevelOfDetail>();
    // Do not request sectors that are already in scene
    const filterWantedSectorsDistinctFromCurrent = filter(
      (wantedSector: WantedSector) => currentLevelOfDetail.get(wantedSector.sectorId) !== wantedSector.levelOfDetail
    );
    // Do not continue with sectors already in scene
    const filterConsumedSectorsDistinctFromCurrent = filter(
      (consumedSector: ConsumedSector) =>
        currentLevelOfDetail.get(consumedSector.sectorId) !== consumedSector.levelOfDetail
    );
    const pipeline = new Subject<ThreeCameraConfig>();
    pipeline
      .pipe(
        // TODO 2020-04-15 larsmoa: Reduce delay to something more sensible
        // Temporary workaround to avoid flooding the GPU pipeline with readPixels.
        debounceTime(150),
        fromThreeCameraConfig(),
        // Determine all wanted sectors
        map(input => this._sectorCuller.determineSectors(input)),

        // Take sectors within budget
        map(wantedSectors => this.budget.filter(wantedSectors, this._sectorScene)),
        // Load sectors from repository
        share(),
        publish((wantedSectorsObservable: Observable<WantedSector[]>) =>
          wantedSectorsObservable.pipe(
            tap(_ => this._repository.clearSemaphore()),
            mergeAll(),
            filterWantedSectorsDistinctFromCurrent,
            this._repository.loadSector(),
            filterConsumedSectorsDistinctFromCurrent,
            filterCurrentWantedSectors(wantedSectorsObservable)
          )
        ),
        observeOn(animationFrameScheduler)
      ) // Consume sectors
      .subscribe((sector: ConsumedSector) => {
        currentLevelOfDetail.set(sector.sectorId, sector.levelOfDetail);
        const sectorNode = this.rootSector.sectorNodeMap.get(sector.sectorId);
        if (!sectorNode) {
          throw new Error(`Could not find 3D node for sector ${sector.sectorId} - invalid id?`);
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
    const bboxNode = this._boundingBoxNode.children.find(x => x.userData.sectorId === sector.sectorId)!;
    bboxNode.visible = sector.levelOfDetail !== LevelOfDetail.Discarded;
  }

  private createBoundingBoxNode(sectors: SectorMetadata[]): THREE.Object3D {
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
    boxesNode.applyMatrix4(toThreeMatrix4(this.modelTransformation.modelMatrix));
    boxesNode.name = 'Bounding boxes (for debugging)';
    sectors.forEach(sector => {
      const bbox = toThreeJsBox3(new THREE.Box3(), sector.bounds);
      const color = colors[sectorDepth(sector)];
      const boxMesh = new THREE.Box3Helper(bbox, color);
      boxMesh.name = `${sector.id}`;
      boxMesh.userData.sectorId = sector.id;
      boxMesh.visible = false;
      boxesNode.add(boxMesh);
    });
    return boxesNode;
  }
}
