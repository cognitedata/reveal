/*!
 * Copyright 2022 Cognite AS
 */

import { WebGLRenderer, PerspectiveCamera, Vector2 } from 'three';

import { CameraManager } from '@reveal/camera-manager';
import assert from 'assert';

export type ResizeHandlerOptions = {
  renderResolutionThreshold?: number;
  movingResolutionFactor?: number;
};

export class ResizeHandler {
  private readonly _defaultResolutionThreshold = 1.4e6;

  private readonly _renderer: WebGLRenderer;
  private readonly _cameraManager: CameraManager;

  private _stoppedCameraResolutionThreshold: number;
  private _currentResolutionThreshold: number;
  private readonly _movingResolutionFactor: number = 1;

  private readonly _resizeObserver: ResizeObserver | undefined;

  private _shouldResize: boolean = false;

  constructor(renderer: WebGLRenderer, cameraManager: CameraManager, resizeOptions?: ResizeHandlerOptions) {
    this._stoppedCameraResolutionThreshold =
      resizeOptions?.renderResolutionThreshold ?? this._defaultResolutionThreshold;
    this._currentResolutionThreshold = this._stoppedCameraResolutionThreshold;

    this._resizeObserver = this.setupResizeListener(renderer);
    this._cameraManager = cameraManager;

    this._renderer = renderer;

    if (resizeOptions?.movingResolutionFactor) {
      assert(resizeOptions.movingResolutionFactor > 0 && resizeOptions.movingResolutionFactor <= 1);
      this._movingResolutionFactor = resizeOptions?.movingResolutionFactor;
      this._cameraManager.on('cameraStop', () => {
        this._currentResolutionThreshold = this._stoppedCameraResolutionThreshold;
        this._shouldResize = true;
      });

      this._cameraManager.on('cameraChange', () => {
        this._currentResolutionThreshold = this._stoppedCameraResolutionThreshold * this._movingResolutionFactor;
        this._shouldResize = true;
      });
    }
  }

  public get needsRedraw(): boolean {
    return this._shouldResize;
  }

  public resetRedraw(): void {
    this._shouldResize = false;
  }

  public setResolutionThreshold(threshold: number): void {
    this._stoppedCameraResolutionThreshold = threshold;
    this._currentResolutionThreshold = threshold;
    this._shouldResize = true;
  }

  public handleResize(camera: PerspectiveCamera): void {
    if (this._shouldResize) {
      this.resize(camera);
      this._shouldResize = false;
    }
  }

  private setupResizeListener(renderer: THREE.WebGLRenderer): ResizeObserver | undefined {
    const domElement = renderer.domElement.parentElement;
    if (!domElement) {
      throw new Error('Canvas does not have a parent element');
    }
    const resizeObserver = new ResizeObserver(() => (this._shouldResize = true));
    resizeObserver.observe(domElement);

    return resizeObserver;
  }

  private resize(camera: THREE.PerspectiveCamera): void {
    const canvas = this._renderer.domElement;
    const domElement = canvas.parentElement;

    if (!domElement) {
      throw new Error('Canvas does not have a parent element');
    }

    const virtualFramebufferSize = this._renderer.getSize(new Vector2());
    const pixelRatio = this._renderer.getPixelRatio();

    const virtualDomElementWidth = domElement.clientWidth !== 0 ? domElement.clientWidth : canvas.clientWidth;
    const virtualDomElementHeight = domElement.clientHeight !== 0 ? domElement.clientHeight : canvas.clientHeight;

    const domElementPhysicalWidth = virtualDomElementWidth * pixelRatio;
    const domElementPhysicalHeight = virtualDomElementHeight * pixelRatio;
    const domElementPhysicalNumberOfPixels = domElementPhysicalWidth * domElementPhysicalHeight;

    const downScale =
      domElementPhysicalNumberOfPixels > this._currentResolutionThreshold
        ? Math.sqrt(this._currentResolutionThreshold / domElementPhysicalNumberOfPixels)
        : 1;

    const newVirtualWidth = Math.round(virtualDomElementWidth * downScale);
    const newVirtualHeight = Math.round(virtualDomElementHeight * downScale);

    if (newVirtualWidth === virtualFramebufferSize.x && newVirtualHeight === virtualFramebufferSize.y) {
      return;
    }

    camera.aspect = newVirtualWidth / newVirtualHeight;
    camera.updateProjectionMatrix();
    this._renderer.setDrawingBufferSize(newVirtualWidth, newVirtualHeight, pixelRatio);
  }

  dispose(): void {
    this._resizeObserver?.disconnect();
  }
}
