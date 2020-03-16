/*!
 * Copyright 2020 Cognite AS
 */

import * as THREE from 'three';
import { vec3, mat4 } from 'gl-matrix';

import {
  SectorModelTransformation,
  SectorScene,
  SectorMetadata,
  WantedSectors,
  SectorQuads,
  Sector
} from '../../../models/cad/types';
import { defaultDetermineSectors } from '../../../models/cad/determineSectors';
import { DetermineSectorsDelegate } from '../../../models/cad/delegates';
import { CadLoadingHints } from '../../../models/cad/CadLoadingHints';
import { CadModel } from '../../../models/cad/CadModel';
import { CadRenderHints } from '../../CadRenderHints';
import { suggestCameraConfig } from '../../../utils/cameraUtils';
import { SectorNode } from './SectorNode';
import { fromThreeVector3, fromThreeMatrix, toThreeJsBox3, toThreeVector3, toThreeMatrix4 } from '../utilities';
import { RenderMode } from '../materials';
import { Shading, createDefaultShading } from './shading';
import { RootSectorNode } from './RootSectorNode';
import { BasicSectorActivator, SectorActivator } from '../../../models/cad/BasicSectorActivator';
import { CachedRepository } from '../../../repository/cad/CachedRepository';
import { Repository } from '../../../repository/cad/Repository';

interface CadNodeOptions {
  shading?: Shading;
}

export interface SuggestedCameraConfig {
  position: THREE.Vector3;
  target: THREE.Vector3;
  near: number;
  far: number;
}

const updateVars = {
  cameraPosition: vec3.create(),
  cameraModelMatrix: mat4.create(),
  projectionMatrix: mat4.create()
};

export class CadNode extends THREE.Object3D {
  public readonly rootSector: SectorNode;
  public readonly modelTransformation: SectorModelTransformation;

  private _determineSectors: DetermineSectorsDelegate;
  private _simpleSectorActivator: SectorActivator;
  private _detailedSectorActivator: SectorActivator;
  private _renderHints: CadRenderHints;
  private _loadingHints: CadLoadingHints;
  private _renderMode: RenderMode;

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

    this._detailedSectorActivator = new BasicSectorActivator<Sector>(
      sectorId => {
        return this._repository.getDetailed(sectorId);
      },
      sectorId => {
        // this redirection is necessary to capture the correct this-keyword
        rootSector.discard(sectorId);
      },
      (sectorId: number, sector: Sector) => {
        // this redirection is necessary to capture the correct this-keyword
        rootSector.consumeDetailed(sectorId, sector);
      }
    );
    this._simpleSectorActivator = new BasicSectorActivator<SectorQuads>(
      sectorId => {
        return this._repository.getSimple(sectorId);
      },
      sectorId => {
        // this redirection is necessary to capture the correct this-keyword
        rootSector.discard(sectorId);
      },
      (sectorId: number, sector: SectorQuads) => {
        // this redirection is necessary to capture the correct this-keyword
        rootSector.consumeSimple(sectorId, sector);
      }
    );
    const { scene, modelTransformation } = model;

    this._sectorScene = scene;
    this._determineSectors = defaultDetermineSectors;
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

    this._shading.updateNodes(indices);
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

  set determineSectors(determineSectors: DetermineSectorsDelegate) {
    this._determineSectors = determineSectors;
  }

  get determineSectors() {
    return this._determineSectors;
  }

  private get shouldRenderSectorBoundingBoxes(): boolean {
    return this._renderHints.showSectorBoundingBoxes || false;
  }

  public async update(camera: THREE.PerspectiveCamera): Promise<boolean> {
    let needsRedraw = false;
    const { cameraPosition, cameraModelMatrix, projectionMatrix } = updateVars;
    if (!this._previousCameraMatrix.equals(camera.matrixWorld)) {
      camera.matrixWorldInverse.getInverse(camera.matrixWorld);

      fromThreeVector3(cameraPosition, camera.position, this.modelTransformation);
      fromThreeMatrix(cameraModelMatrix, camera.matrixWorld, this.modelTransformation);
      fromThreeMatrix(projectionMatrix, camera.projectionMatrix);
      const wantedSectors = await this._determineSectors({
        scene: this._sectorScene,
        cameraFov: camera.fov,
        cameraPosition,
        cameraModelMatrix,
        projectionMatrix,
        loadingHints: this.loadingHints
      });
      needsRedraw = this._detailedSectorActivator.update(wantedSectors.detailed) || needsRedraw;
      needsRedraw = this._simpleSectorActivator.update(wantedSectors.simple) || needsRedraw;

      if (this.shouldRenderSectorBoundingBoxes) {
        this.updateSectorBoundingBoxes(wantedSectors);
      }

      this._previousCameraMatrix.copy(camera.matrixWorld);
    }
    needsRedraw = this._detailedSectorActivator.refresh() || needsRedraw;
    needsRedraw = this._simpleSectorActivator.refresh() || needsRedraw;
    return needsRedraw;
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

  private updateSectorBoundingBoxes(wantedSectors: WantedSectors) {
    this._boundingBoxNode.children.forEach(x => {
      const sectorId = x.userData.sectorId as number;
      const boxHelper = x as THREE.Box3Helper;
      boxHelper.visible = wantedSectors.detailed.has(sectorId) || wantedSectors.simple.has(sectorId);
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
