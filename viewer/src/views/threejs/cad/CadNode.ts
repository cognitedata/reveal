/*!
 * Copyright 2019 Cognite AS
 */

import * as THREE from 'three';
import { vec3, mat4 } from 'gl-matrix';

import { SectorNode } from './SectorNode';
import { SectorModelTransformation, SectorScene, SectorMetadata, WantedSectors } from '../../../models/cad/types';
import { fromThreeVector3, fromThreeMatrix, toThreeMatrix4, toThreeJsBox3, toThreeVector3 } from '../utilities';
import { SectorActivator } from '../../../models/cad/initializeSectorLoader';
import { DetermineSectorsDelegate } from '../../../models/cad/delegates';
import { CadRenderHints } from '../../CadRenderHints';
import { CadLoadingHints } from '../../../models/cad/CadLoadingHints';
import { CadModel, createThreeJsSectorNode } from '../../..';
import { suggestCameraConfig } from '../../../utils/cameraUtils';
import { defaultDetermineSectors } from '../../../models/cad/determineSectors';

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
  private _simpleActivator: SectorActivator;
  private _detailedActivator: SectorActivator;
  private _renderHints: CadRenderHints;
  private _loadingHints: CadLoadingHints;

  private readonly _sectorScene: SectorScene;
  private readonly _previousCameraMatrix = new THREE.Matrix4();
  private readonly _boundingBoxNode: THREE.Object3D;

  constructor(model: CadModel) {
    super();
    this.name = 'Sector model';

    const { rootSector, simpleActivator, detailedActivator } = createThreeJsSectorNode(model);
    const { scene, modelTransformation } = model;

    this.rootSector = rootSector;
    this.add(rootSector);
    this._boundingBoxNode = this.createBoundingBoxNode(scene.sectors);
    this.add(this._boundingBoxNode);

    this._sectorScene = scene;
    this._determineSectors = defaultDetermineSectors;
    this._simpleActivator = simpleActivator;
    this._detailedActivator = detailedActivator;
    this.modelTransformation = modelTransformation;
    // Ensure camera matrix is unequal on first frame
    this._previousCameraMatrix.elements[0] = Infinity;

    // // Apply model matrix to this model
    // this.applyMatrix(toThreeMatrix4(modelTransformation.modelMatrix));

    // Apply default hints
    this._renderHints = {};
    this._loadingHints = {};
    this.renderHints = {};
    this.loadingHints = {};
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
      needsRedraw = this._detailedActivator.update(wantedSectors.detailed) || needsRedraw;
      needsRedraw = this._simpleActivator.update(wantedSectors.simple) || needsRedraw;

      if (this.shouldRenderSectorBoundingBoxes) {
        this.updateSectorBoundingBoxes(wantedSectors);
      }

      this._previousCameraMatrix.copy(camera.matrixWorld);
    }
    needsRedraw = this._detailedActivator.refresh() || needsRedraw;
    needsRedraw = this._simpleActivator.refresh() || needsRedraw;
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
    boxesNode.name = 'Bounding boxes (for debugging)';
    sectors.forEach(sector => {
      const bbox = toThreeJsBox3(sector.bounds);
      const color = colors[sectorDepth(sector)];
      const boxMesh = new THREE.Box3Helper(bbox, color);
      boxMesh.name = `${sector.id}`;
      boxMesh.userData.sectorId = sector.id;
      boxesNode.add(boxMesh);
    });
    return boxesNode;
  }
}
