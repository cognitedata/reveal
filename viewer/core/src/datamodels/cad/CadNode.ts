/*!
 * Copyright 2021 Cognite AS
 */

import * as THREE from 'three';

import { SectorGeometry, SectorScene } from './sector/types';
import { InstancedMeshFile, SectorQuads } from './rendering/types';
import { RootSectorNode } from './sector/RootSectorNode';
import { RenderMode } from './rendering/RenderMode';
import { CadMaterialManager } from './CadMaterialManager';
import { CadModelMetadata } from './CadModelMetadata';
import { suggestCameraConfig } from './cameraconfig';

import { NodeTransformProvider } from './styling/NodeTransformProvider';
import { InstancedMeshManager } from './InstancedMeshManager';
import { NodeAppearanceProvider } from './styling/NodeAppearanceProvider';
import { NodeAppearance } from './NodeAppearance';

export type ParseCallbackDelegate = (parsed: { lod: string; data: SectorGeometry | SectorQuads }) => void;

export interface SuggestedCameraConfig {
  position: THREE.Vector3;
  target: THREE.Vector3;
  near: number;
  far: number;
}

export class CadNode extends THREE.Object3D {
  private readonly _rootSector: RootSectorNode;
  private readonly _cadModelMetadata: CadModelMetadata;
  private readonly _materialManager: CadMaterialManager;
  private readonly _sectorScene: SectorScene;
  private readonly _previousCameraMatrix = new THREE.Matrix4();
  private readonly _instancedMeshManager: InstancedMeshManager;

  constructor(model: CadModelMetadata, materialManager: CadMaterialManager) {
    super();
    this.type = 'CadNode';
    this.name = 'Sector model';
    this._materialManager = materialManager;

    const instancedMeshGroup = new THREE.Group();
    instancedMeshGroup.name = 'InstancedMeshes';

    this._instancedMeshManager = new InstancedMeshManager(instancedMeshGroup, materialManager);

    const rootSector = new RootSectorNode(model);

    rootSector.add(instancedMeshGroup);

    this._cadModelMetadata = model;
    const { scene } = model;

    this._sectorScene = scene;
    // Ensure camera matrix is unequal on first frame
    this._previousCameraMatrix.elements[0] = Infinity;

    // Prepare renderables
    this._rootSector = rootSector;
    this.add(rootSector);

    this.matrixAutoUpdate = false;
    this.updateMatrixWorld();
    this.setModelTransformation(model.modelMatrix);
  }

  get nodeTransformProvider(): NodeTransformProvider {
    return this._materialManager.getModelNodeTransformProvider(this._cadModelMetadata.blobUrl);
  }

  get nodeAppearanceProvider(): NodeAppearanceProvider {
    return this._materialManager.getModelNodeAppearanceProvider(this._cadModelMetadata.blobUrl);
  }

  get defaultNodeAppearance(): NodeAppearance {
    return this._materialManager.getModelDefaultNodeAppearance(this._cadModelMetadata.blobUrl);
  }

  set defaultNodeAppearance(appearance: NodeAppearance) {
    this._materialManager.setModelDefaultNodeAppearance(this._cadModelMetadata.blobUrl, appearance);
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

  /**
   * Sets transformation matrix of the model. This overrides the current transformation.
   * @param matrix Transformation matrix.
   */
  setModelTransformation(matrix: THREE.Matrix4): void {
    this._rootSector.setModelTransformation(matrix);
    this._cadModelMetadata.modelMatrix.copy(matrix);
  }

  /**
   * Gets transformation matrix of the model
   * @param out Preallocated `THREE.Matrix4` (optional).
   */
  getModelTransformation(out?: THREE.Matrix4): THREE.Matrix4 {
    return this._rootSector.getModelTransformation(out);
  }

  public suggestCameraConfig(): SuggestedCameraConfig {
    const { position, target, near, far } = suggestCameraConfig(this._sectorScene.root);

    const modelMatrix = this.getModelTransformation();
    const threePos = position.clone();
    const threeTarget = target.clone();
    threePos.applyMatrix4(modelMatrix);
    threeTarget.applyMatrix4(modelMatrix);

    return {
      position: threePos,
      target: threeTarget,
      near,
      far
    };
  }

  public updateInstancedMeshes(instanceMeshFiles: InstancedMeshFile[], modelIdentifier: string, sectorId: number) {
    for (const instanceMeshFile of instanceMeshFiles) {
      this._instancedMeshManager.addInstanceMeshes(instanceMeshFile, modelIdentifier, sectorId);
    }
  }

  public discardInstancedMeshes(sectorId: number) {
    this._instancedMeshManager.removeSectorInstancedMeshes(sectorId);
  }
}
