/*!
 * Copyright 2020 Cognite AS
 */

import * as THREE from 'three';

import { SectorModelTransformation, SectorMetadata, SectorGeometry, SectorScene } from './sector/types';
import { SectorQuads } from './rendering/types';
import { CadRenderHints } from './rendering/CadRenderHints';
import { LevelOfDetail } from './sector/LevelOfDetail';
import { NodeAppearanceProvider } from './NodeAppearance';
import { ConsumedSector } from './sector/types';
import { RootSectorNode } from './sector/RootSectorNode';
import { RenderMode } from './rendering/RenderMode';
import { toThreeVector3, toThreeMatrix4, toThreeJsBox3 } from '@/utilities';
import { CadLoadingHints } from './CadLoadingHints';
import { MaterialManager } from './MaterialManager';
import { CadModelMetadata } from './CadModelMetadata';
import { suggestCameraConfig } from './cameraconfig';

export type ParseCallbackDelegate = (parsed: { lod: string; data: SectorGeometry | SectorQuads }) => void;

export interface CadNodeOptions {
  nodeAppearanceProvider?: NodeAppearanceProvider;
}

export interface SuggestedCameraConfig {
  position: THREE.Vector3;
  target: THREE.Vector3;
  near: number;
  far: number;
}

export class CadNode extends THREE.Object3D {
  public readonly modelTransformation: SectorModelTransformation;

  private _renderHints: CadRenderHints;
  private _loadingHints: CadLoadingHints;

  private readonly _rootSector: RootSectorNode;
  private readonly _cadModelMetadata: CadModelMetadata;
  private readonly _materialManager: MaterialManager;
  private readonly _sectorScene: SectorScene;
  private readonly _previousCameraMatrix = new THREE.Matrix4();
  private readonly _boundingBoxNode: THREE.Object3D;

  constructor(model: CadModelMetadata, materialManager: MaterialManager) {
    super();
    this.type = 'CadNode';
    this.name = 'Sector model';
    this._materialManager = materialManager;

    const rootSector = new RootSectorNode(model);
    this._cadModelMetadata = model;
    const { scene, modelTransformation } = model;

    this._sectorScene = scene;
    this.modelTransformation = modelTransformation;
    // Ensure camera matrix is unequal on first frame
    this._previousCameraMatrix.elements[0] = Infinity;

    // Prepare renderables
    this._rootSector = rootSector;
    this.add(rootSector);

    this._boundingBoxNode = this.createBoundingBoxNode(scene.getAllSectors());
    this.add(this._boundingBoxNode);

    // Apply default hints
    this._renderHints = {};
    this._loadingHints = {};
    this.renderHints = {};
    this.loadingHints = {};

    this.matrixAutoUpdate = false;
    this.updateMatrixWorld();
  }

  get clippingPlanes(): THREE.Plane[] {
    return this._materialManager.clippingPlanes;
  }

  set clippingPlanes(planes: THREE.Plane[]) {
    this._materialManager.clippingPlanes = planes;
  }

  get clipIntersection(): boolean {
    return this._materialManager.clipIntersection;
  }

  set clipIntersection(intersection: boolean) {
    this._materialManager.clipIntersection = intersection;
  }

  requestNodeUpdate(treeIndices: number[]) {
    this._materialManager.updateModelNodes(this._cadModelMetadata.blobUrl, treeIndices);
    this.dispatchEvent({ type: 'update' });
  }

  get cadModelMetadata() {
    return this._cadModelMetadata;
  }

  get sectorScene() {
    return this._sectorScene;
  }

  get rootSector() {
    return this._rootSector;
  }

  get materialManager() {
    return this._materialManager;
  }

  set renderMode(mode: RenderMode) {
    this._materialManager.setRenderMode(mode);
  }

  get renderMode() {
    return this._materialManager.getRenderMode();
  }

  set renderHints(hints: Readonly<CadRenderHints>) {
    this._renderHints = hints;
    // this._boundingBoxNode.visible = this.shouldRenderSectorBoundingBoxes;
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

  // private get shouldRenderSectorBoundingBoxes(): boolean {
  //   return this._renderHints.showSectorBoundingBoxes || false;
  // }

  public suggestCameraConfig(): SuggestedCameraConfig {
    const { position, target, near, far } = suggestCameraConfig(this._sectorScene.root);

    return {
      position: toThreeVector3(new THREE.Vector3(), position, this.modelTransformation),
      target: toThreeVector3(new THREE.Vector3(), target, this.modelTransformation),
      near,
      far
    };
  }

  // TODO 2020-05-22 larsmoa: Remove this function and move bounding box tree outside CadNode.
  updateSectorBoundingBox(sector: ConsumedSector) {
    const bboxNode = this._boundingBoxNode.children.find(x => x.userData.sectorId === sector.metadata.id)!;
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
    boxesNode.name = 'Bounding boxes (for debugging)';
    sectors.forEach(sector => {
      const bbox = toThreeJsBox3(new THREE.Box3(), sector.bounds);
      const color = colors[sectorDepth(sector)];
      const boxMesh = new THREE.Box3Helper(bbox, color);
      boxMesh.name = `${sector.id}`;
      boxMesh.userData.sectorId = sector.id;
      boxMesh.visible = false;
      boxesNode.add(boxMesh);

      boxMesh.matrixAutoUpdate = false;
      boxMesh.updateMatrixWorld(true);
    });
    boxesNode.matrixAutoUpdate = false;
    boxesNode.applyMatrix4(toThreeMatrix4(this.modelTransformation.modelMatrix));
    boxesNode.updateMatrixWorld(true);
    return boxesNode;
  }
}
