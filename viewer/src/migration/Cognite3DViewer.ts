/*!
 * Copyright 2020 Cognite AS
 */

import * as THREE from 'three';
import ComboControls from '@cognite/three-combo-controls';

import { Cognite3DModel } from './Cognite3DModel';
import { Cognite3DViewerOptions, AddModelOptions } from './types';
import { NotSupportedInMigrationWrapperError } from './NotSupportedInMigrationWrapperError';
import { Intersection } from './intersection';

export class Cognite3DViewer {
  private get canvas(): HTMLCanvasElement {
    return this.renderer.domElement;
  }
  static isBrowserSupported(): boolean {
    return true;
  }

  readonly domElement: HTMLElement;
  private readonly renderer: THREE.WebGLRenderer;
  private readonly camera: THREE.PerspectiveCamera;
  private readonly scene: THREE.Scene;
  private readonly controls: ComboControls;

  private readonly models: Cognite3DModel[] = [];
  private readonly additionalObjects: THREE.Object3D[] = [];

  constructor(options?: Cognite3DViewerOptions) {
    if (options && !options.enableCache) {
      throw new NotSupportedInMigrationWrapperError('Cache is not supported');
    }
    if (options && !options.logMetrics) {
      throw new NotSupportedInMigrationWrapperError('LogMetris is not supported');
    }

    this.renderer = new THREE.WebGLRenderer();
    this.canvas.style.width = '640px';
    this.canvas.style.height = '480px';
    this.canvas.style.minWidth = '100%';
    this.canvas.style.minHeight = '100%';
    this.canvas.style.maxWidth = '100%';
    this.canvas.style.maxHeight = '100%';
    this.domElement = createCanvasWrapper();
    this.domElement.appendChild(this.canvas);

    this.camera = new THREE.PerspectiveCamera(60, undefined, 0.1, 10000);
    this.camera.position.x = 30;
    this.camera.position.y = 10;
    this.camera.position.z = 50;
    this.camera.lookAt(new THREE.Vector3());

    this.scene = new THREE.Scene();
    this.controls = new ComboControls(this.camera, this.canvas);
    this.controls.dollyFactor = 0.992;
    this.controls.enabled = false;
  }

  dispose(): void {
    throw new NotSupportedInMigrationWrapperError();
  }

  onClick(callback: (event: PointerEvent) => void): void {
    throw new NotSupportedInMigrationWrapperError();
  }
  offClick(callback: (event: PointerEvent) => void): void {
    throw new NotSupportedInMigrationWrapperError();
  }
  onHover(callback: (event: PointerEvent) => void): void {
    throw new NotSupportedInMigrationWrapperError();
  }
  offHover(callback: (event: PointerEvent) => void): void {
    throw new NotSupportedInMigrationWrapperError();
  }
  onCameraChange(callback: (position: THREE.Vector3, target: THREE.Vector3) => void): void {
    throw new NotSupportedInMigrationWrapperError();
  }
  offCameraChange(callback: (position: THREE.Vector3, target: THREE.Vector3) => void): void {
    throw new NotSupportedInMigrationWrapperError();
  }

  addModel(options: AddModelOptions): Promise<Cognite3DModel> {
    throw new NotSupportedInMigrationWrapperError();
  }
  addObject3D(object: THREE.Object3D): void {
    throw new NotSupportedInMigrationWrapperError();
  }
  removeObject3D(object: THREE.Object3D): void {
    throw new NotSupportedInMigrationWrapperError();
  }

  setSlicingPlanes(slicingPlanes: THREE.Plane[]): void {
    throw new NotSupportedInMigrationWrapperError();
  }

  getCameraPosition(): THREE.Vector3 {
    throw new NotSupportedInMigrationWrapperError();
  }
  getCameraTarget(): THREE.Vector3 {
    throw new NotSupportedInMigrationWrapperError();
  }
  setCameraPosition(position: THREE.Vector3): void {
    throw new NotSupportedInMigrationWrapperError();
  }
  setCameraTarget(position: THREE.Vector3): void {
    throw new NotSupportedInMigrationWrapperError();
  }

  fitCameraToModel(model: Cognite3DModel, duration?: number): void {
    throw new NotSupportedInMigrationWrapperError();
  }
  fitCameraToBoundingBox(box: THREE.Box3, duration?: number, radiusFactor?: number): void {
    throw new NotSupportedInMigrationWrapperError();
  }

  enableKeyboardNavigation(): void {
    throw new NotSupportedInMigrationWrapperError();
  }
  disableKeyboardNavigation(): void {
    throw new NotSupportedInMigrationWrapperError();
  }

  worldToScreen(point: THREE.Vector3, normalize?: boolean): THREE.Vector2 | null {
    throw new NotSupportedInMigrationWrapperError();
  }

  getScreenshot(width?: number, height?: number): Promise<string> {
    throw new NotSupportedInMigrationWrapperError();
  }
  getIntersectionFromPixel(x: number, y: number, cognite3DModel?: Cognite3DModel): null | Intersection {
    throw new NotSupportedInMigrationWrapperError();
  }

  clearCache(): void {
    throw new NotSupportedInMigrationWrapperError('Cache is not supported');
  }
}

function createCanvasWrapper(): HTMLElement {
  const domElement = document.createElementNS('http://www.w3.org/1999/xhtml', 'div');
  domElement.style.width = '100%';
  domElement.style.height = '100%';
  return domElement;
}
