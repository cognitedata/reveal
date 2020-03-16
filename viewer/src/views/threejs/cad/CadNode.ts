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
import { Shading, createDefaultShading } from './shading';
import { RootSectorNode } from './RootSectorNode';
import { CachedRepository } from '../../../repository/cad/CachedRepository';
import { Repository } from '../../../repository/cad/Repository';
import { Subject } from 'rxjs';
import {
  publish,
  share,
  auditTime,
  switchAll,
} from 'rxjs/operators';
import { ConsumedSector } from '../../../data/model/ConsumedSector';
import { fromThreeCameraConfig, ThreeCameraConfig } from './fromThreeCameraConfig';
import { ProximitySectorCuller } from '../../../culling/ProximitySectorCuller';
import { LevelOfDetail } from '../../../data/model/LevelOfDetail';
import { distinctUntilLevelOfDetailChanged } from '../../../models/cad/distinctUntilLevelOfDetailChanged';
import { filterCurrentWantedSectors } from '../../../models/cad/filterCurrentWantedSectors';

interface CadNodeOptions {
  shading?: Shading;
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

  private _sectorCuller: ProximitySectorCuller;
  private _renderHints: CadRenderHints;
  private _loadingHints: CadLoadingHints;
  private _renderMode: RenderMode;

  private readonly _cameraPositionObservable: Subject<ThreeCameraConfig>;
  private readonly _shading: Shading;
  private readonly _sectorScene: SectorScene;
  private readonly _previousCameraMatrix = new THREE.Matrix4();
  private readonly _boundingBoxNode: THREE.Object3D;
  private readonly _repository: Repository;

  constructor(model: CadModel, options?: CadNodeOptions) {
    super();
    this.type = 'CadNode';
    this.name = 'Sector model';

    this._shading = (() => {
      if (options && options.shading) {
        return options.shading;
      }
      return createDefaultShading({
        color(_treeIndex: number) {
          return undefined;
        }
      });
    })();

    const rootSector = new RootSectorNode(model, this._shading);
    this._repository = new CachedRepository(model);

    const { scene, modelTransformation } = model;

    this._sectorScene = scene;
    this._sectorCuller = new ProximitySectorCuller();
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
    for (let i = 0; i < 100; i++) {
      indices.push(i);
    }

    this._shading.updateNodes(indices);

    this._cameraPositionObservable = new Subject();

    this._cameraPositionObservable
      .pipe(
        auditTime(1000),
        fromThreeCameraConfig(),
        this._sectorCuller.determineSectors(),
        share(),
        publish(wantedSectors =>
          wantedSectors.pipe(
            switchAll(),
            distinctUntilLevelOfDetailChanged(),
            this._repository.loadSector(),
            filterCurrentWantedSectors(wantedSectors),
            this.rootSector.consumeSector()
          )
        )
      )
      .subscribe((sector: ConsumedSector) => {
        const sectorNode = rootSector.sectorNodeMap.get(sector.id);
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
  }

  set renderMode(mode: RenderMode) {
    this._renderMode = mode;
    this._shading.materials.box.uniforms.renderMode.value = mode;
    this._shading.materials.circle.uniforms.renderMode.value = mode;
    this._shading.materials.generalRing.uniforms.renderMode.value = mode;
    this._shading.materials.nut.uniforms.renderMode.value = mode;
    this._shading.materials.quad.uniforms.renderMode.value = mode;
    this._shading.materials.cone.uniforms.renderMode.value = mode;
    this._shading.materials.eccentricCone.uniforms.renderMode.value = mode;
    this._shading.materials.sphericalSegment.uniforms.renderMode.value = mode;
    this._shading.materials.torusSegment.uniforms.renderMode.value = mode;
    this._shading.materials.generalCylinder.uniforms.renderMode.value = mode;
    this._shading.materials.trapezium.uniforms.renderMode.value = mode;
    this._shading.materials.ellipsoidSegment.uniforms.renderMode.value = mode;
    this._shading.materials.instancedMesh.uniforms.renderMode.value = mode;
    this._shading.materials.triangleMesh.uniforms.renderMode.value = mode;
    this._shading.materials.simple.uniforms.renderMode.value = mode;
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
      sectorScene: this._sectorScene
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
