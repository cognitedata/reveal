/*!
 * Copyright 2020 Cognite AS
 */

import * as THREE from 'three';

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
import { Subject, Observable } from 'rxjs';
import { publish, share, auditTime, switchAll, flatMap } from 'rxjs/operators';
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

interface CadNodeOptions {
  nodeAppearance?: NodeAppearance;
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

export class CadNode extends THREE.Object3D {
  public readonly rootSector: RootSectorNode;
  public readonly modelTransformation: SectorModelTransformation;

  private _sectorCuller: SectorCuller<DetermineSectorsByProximityInput>;
  private _renderHints: CadRenderHints;
  private _loadingHints: CadLoadingHints;
  private _renderMode: RenderMode;

  private readonly _materialManager: MaterialManager;
  private readonly _cameraPositionObservable: Subject<ThreeCameraConfig>;
  private readonly _sectorScene: SectorScene;
  private readonly _previousCameraMatrix = new THREE.Matrix4();
  private readonly _boundingBoxNode: THREE.Object3D;
  private readonly _repository: Repository;

  constructor(model: CadModel, options?: CadNodeOptions) {
    super();
    this.type = 'CadNode';
    this.name = 'Sector odel';
    this._materialManager = new MaterialManager(options ? options.nodeAppearance : undefined);

    const rootSector = new RootSectorNode(model, this._materialManager.materials);
    this._repository = new CachedRepository(model);

    const { scene, modelTransformation } = model;

    this._sectorScene = scene;
    this._sectorCuller = (options && options.internal && options.internal.sectorCuller) || new ProximitySectorCuller();
    this.modelTransformation = modelTransformation;
    // Ensure camera matrix is unequal on first frame
    this._previousCameraMatrix.elements[0] = Infinity;

    // Prepare renderables
    this.rootSector = rootSector;
    this.add(rootSector);
    this._boundingBoxNode = this.createBoundingBoxNode(scene.sectors);
    this.add(this._boundingBoxNode);

    // Apply default hints
    this._renderHints = {};
    this._loadingHints = {};
    this._renderMode = RenderMode.Color;
    this.renderHints = {};
    this.loadingHints = {};
    this.renderMode = RenderMode.Color;

    const indices = [];
    for (let i = 0; i < scene.maxTreeIndex; i++) {
      indices.push(i);
    }
    this._materialManager.updateNodes(indices);
    this._cameraPositionObservable = this.createLoadSectorsPipeline();
  }

  requestNodeUpdate(treeIndices: number[]) {
    this._materialManager.updateNodes(treeIndices);
  }

  set renderMode(mode: RenderMode) {
    this._renderMode = mode;
    this._materialManager.materials.box.uniforms.renderMode.value = mode;
    this._materialManager.materials.circle.uniforms.renderMode.value = mode;
    this._materialManager.materials.generalRing.uniforms.renderMode.value = mode;
    this._materialManager.materials.nut.uniforms.renderMode.value = mode;
    this._materialManager.materials.quad.uniforms.renderMode.value = mode;
    this._materialManager.materials.cone.uniforms.renderMode.value = mode;
    this._materialManager.materials.eccentricCone.uniforms.renderMode.value = mode;
    this._materialManager.materials.sphericalSegment.uniforms.renderMode.value = mode;
    this._materialManager.materials.torusSegment.uniforms.renderMode.value = mode;
    this._materialManager.materials.generalCylinder.uniforms.renderMode.value = mode;
    this._materialManager.materials.trapezium.uniforms.renderMode.value = mode;
    this._materialManager.materials.ellipsoidSegment.uniforms.renderMode.value = mode;
    this._materialManager.materials.instancedMesh.uniforms.renderMode.value = mode;
    this._materialManager.materials.triangleMesh.uniforms.renderMode.value = mode;
    this._materialManager.materials.simple.uniforms.renderMode.value = mode;
  }

  get renderMode() {
    return this._renderMode;
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

  public update(camera: THREE.PerspectiveCamera) {
    const cameraConfig: ThreeCameraConfig = {
      camera,
      modelTransformation: this.modelTransformation,
      sectorScene: this._sectorScene,
      loadingHints: this.loadingHints
    };
    this._cameraPositionObservable.next(cameraConfig);
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
    const loadSectorOperator = flatMap((s: WantedSector) => this._repository.loadSector(s));
    const consumeSectorOperator = flatMap((sector: ParsedSector) => this.rootSector.consumeSector(sector.id, sector));

    const pipeline = new Subject<ThreeCameraConfig>();
    pipeline
      .pipe(
        auditTime(100),
        fromThreeCameraConfig(),
        this._sectorCuller.determineSectors(),
        share(),
        publish((wantedSectors: Observable<WantedSector[]>) =>
          wantedSectors.pipe(
            switchAll(),
            distinctUntilLevelOfDetailChanged(),
            loadSectorOperator,
            filterCurrentWantedSectors(wantedSectors),
            consumeSectorOperator
          )
        )
      )
      .subscribe((sector: ConsumedSector) => {
        const sectorNode = this.rootSector.sectorNodeMap.get(sector.id);
        if (!sectorNode) {
          throw new Error(`Could not find 3D node for sector ${sector.id} - invalid id?`);
        }
        if (sectorNode.group) {
          sectorNode.remove(sectorNode.group);
        }
        sectorNode.add(sector.group);
        sectorNode.group = sector.group;
        this.updateSectorBoundingBoxes(sector);
        this.dispatchEvent({ type: 'update' });
      });
    return pipeline;
  }

  private updateSectorBoundingBoxes(sector: ConsumedSector) {
    this._boundingBoxNode.children.forEach(x => {
      const sectorId = x.userData.sectorId as number;
      if (sectorId !== sector.id) {
        return;
      }
      const boxHelper = x as THREE.Box3Helper;
      boxHelper.visible = sector.levelOfDetail !== LevelOfDetail.Discarded;
    });
  }

  private createBoundingBoxNode(sectors: Map<number, SectorMetadata>): THREE.Object3D {
    function sectorDepth(s: SectorMetadata) {
      return s.path.length / 2; // Path are on format 'x/y/z/'
    }

    const maxColorDepth = [...sectors.values()].reduce((max, s) => Math.max(max, sectorDepth(s)), 0.0);
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
      boxesNode.add(boxMesh);
    });
    return boxesNode;
  }
}
