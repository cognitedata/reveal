/*!
 * Copyright 2020 Cognite AS
 */

import * as THREE from 'three';

import { SectorModelTransformation, SectorMetadata, Sector, SectorQuads } from '../../../models/cad/types';
import { SectorScene } from '../../../models/cad/SectorScene';
import { CadLoadingHints } from '../../../models/cad/CadLoadingHints';
import { CadModel } from '../../../models/cad/CadModel';
import { CadRenderHints } from '../../CadRenderHints';
import { suggestCameraConfig } from '../../../utils/cameraUtils';
import { toThreeJsBox3, toThreeVector3, toThreeMatrix4 } from '../utilities';
import { RenderMode } from '../materials';
import { RootSectorNode } from './RootSectorNode';
import { ModelNodeAppearance } from '../../common/cad/ModelNodeAppearance';
import { MaterialManager } from './MaterialManager';

export type ParseCallbackDelegate = (parsed: { lod: string; data: Sector | SectorQuads }) => void;

export interface CadNodeOptions {
  nodeAppearance?: ModelNodeAppearance;
}

export interface SuggestedCameraConfig {
  position: THREE.Vector3;
  target: THREE.Vector3;
  near: number;
  far: number;
}

export class CadNode extends THREE.Object3D {
  public readonly _rootSector: RootSectorNode;
  public readonly modelTransformation: SectorModelTransformation;

  private _renderHints: CadRenderHints;
  private _loadingHints: CadLoadingHints;

  private readonly _cadModel: CadModel;
  private readonly _materialManager: MaterialManager;
  private readonly _sectorScene: SectorScene;
  private readonly _previousCameraMatrix = new THREE.Matrix4();
  private readonly _boundingBoxNode: THREE.Object3D;

  constructor(model: CadModel, materialManager: MaterialManager) {
    super();
    this.type = 'CadNode';
    this.name = 'Sector model';
    this._materialManager = materialManager;

    const rootSector = new RootSectorNode(model);
    this._cadModel = model;
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
    this._materialManager.updateModelNodes(this._cadModel.identifier, treeIndices);
    this.dispatchEvent({ type: 'update' });
  }

  get cadModel() {
    return this._cadModel;
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

  public suggestCameraConfig(): SuggestedCameraConfig {
    const { position, target, near, far } = suggestCameraConfig(this._sectorScene.root);

    return {
      position: toThreeVector3(new THREE.Vector3(), position, this.modelTransformation),
      target: toThreeVector3(new THREE.Vector3(), target, this.modelTransformation),
      near,
      far
    };
  }

  // TODO: j-bjorne 29-04-2020: Check if still needed!
  // private updateSectorBoundingBoxes(sector: ConsumedSector) {
  //   const bboxNode = this._boundingBoxNode.children.find(x => x.userData.sectorId === sector.metadata.id)!;
  //   bboxNode.visible = sector.levelOfDetail !== LevelOfDetail.Discarded;
  // }

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
