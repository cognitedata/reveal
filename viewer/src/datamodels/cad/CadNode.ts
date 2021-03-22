/*!
 * Copyright 2021 Cognite AS
 */

import * as THREE from 'three';

import { SectorGeometry, SectorScene } from './sector/types';
import { SectorQuads } from './rendering/types';

import { NodeAppearanceProvider } from './NodeAppearance';

import { RootSectorNode } from './sector/RootSectorNode';
import { RenderMode } from './rendering/RenderMode';
import { CadLoadingHints } from './CadLoadingHints';
import { MaterialManager } from './MaterialManager';
import { CadModelMetadata } from './CadModelMetadata';
import { suggestCameraConfig } from './cameraconfig';
import { toThreeVector3, NumericRange } from '../../utilities';
import { EventTrigger } from '../../utilities/events';

export type ParseCallbackDelegate = (parsed: { lod: string; data: SectorGeometry | SectorQuads }) => void;

export type LoadingHintsChangeListener = (loadingHint: CadLoadingHints) => void;

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
  private _loadingHints: CadLoadingHints;

  private readonly _rootSector: RootSectorNode;
  private readonly _cadModelMetadata: CadModelMetadata;
  private readonly _materialManager: MaterialManager;
  private readonly _sectorScene: SectorScene;
  private readonly _previousCameraMatrix = new THREE.Matrix4();

  private readonly _events = {
    loadingHintsChanged: new EventTrigger<LoadingHintsChangeListener>()
  };

  constructor(model: CadModelMetadata, materialManager: MaterialManager) {
    super();
    this.type = 'CadNode';
    this.name = 'Sector model';
    this._materialManager = materialManager;

    const rootSector = new RootSectorNode(model);
    this._cadModelMetadata = model;
    const { scene } = model;

    this._sectorScene = scene;
    // Ensure camera matrix is unequal on first frame
    this._previousCameraMatrix.elements[0] = Infinity;

    // Prepare renderables
    this._rootSector = rootSector;
    this.add(rootSector);

    // Apply default hints
    this._loadingHints = {};

    this.matrixAutoUpdate = false;
    this.updateMatrixWorld();
    this.setModelTransformation(model.modelMatrix);
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

  requestNodeUpdate(treeIndices: number[]): void;
  // @internal
  requestNodeUpdate(treeIndices: NumericRange): void;
  requestNodeUpdate(treeIndices: number[] | NumericRange) {
    if (treeIndices instanceof NumericRange) {
      // TODO 2020-08-10 larsmoa: Avoid expanding the array to avoid uncessary allocations (this
      // will allocate ~16 Mb for a medium sized model)
      const asArray = treeIndices.toArray();
      this._materialManager.updateModelNodes(this._cadModelMetadata.blobUrl, asArray);
    } else {
      this._materialManager.updateModelNodes(this._cadModelMetadata.blobUrl, treeIndices);
    }
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

  set loadingHints(hints: Readonly<CadLoadingHints>) {
    this._loadingHints = hints;
    this._events.loadingHintsChanged.fire(hints);
  }

  get loadingHints(): Readonly<CadLoadingHints> {
    return this._loadingHints;
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
    const threePos = toThreeVector3(new THREE.Vector3(), position);
    const threeTarget = toThreeVector3(new THREE.Vector3(), target);
    threePos.applyMatrix4(modelMatrix);
    threeTarget.applyMatrix4(modelMatrix);

    return {
      position: threePos,
      target: threeTarget,
      near,
      far
    };
  }

  public on(event: 'loadingHintsChanged', listener: LoadingHintsChangeListener): void {
    switch (event) {
      case 'loadingHintsChanged':
        this._events.loadingHintsChanged.subscribe(listener as LoadingHintsChangeListener);
        break;

      default:
        throw new Error(`Unsupported event '${event}'`);
    }
  }

  public off(event: 'loadingHintsChanged', listener: LoadingHintsChangeListener): void {
    switch (event) {
      case 'loadingHintsChanged':
        this._events.loadingHintsChanged.unsubscribe(listener as LoadingHintsChangeListener);
        break;

      default:
        throw new Error(`Unsupported event '${event}'`);
    }
  }
}
