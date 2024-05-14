/*!
 * Copyright 2022 Cognite AS
 */

import { WebGLRenderer, PerspectiveCamera, Vector2 } from 'three';

import { CameraManager } from '@reveal/camera-manager';

export type ResizeHandlerOptions = {
  renderResolutionThreshold?: number;
};

export class ResizeHandler {
  private readonly _defaultResolutionThreshold = 1.4e6;

  private readonly _renderer: WebGLRenderer;
  private readonly _cameraManager: CameraManager;

  private _stoppedCameraResolutionThreshold: number;
  private _currentResolutionThreshold: number;
  private _movingResolutionFactor: number = 1;

  private readonly _onCameraChangeCallback: () => void;
  private readonly _onCameraStopCallback: () => void;

  private _resizeObserver: ResizeObserver | undefined;

  private _shouldResize: boolean = false;

  constructor(renderer: WebGLRenderer, cameraManager: CameraManager, resizeOptions?: ResizeHandlerOptions) {
    this._stoppedCameraResolutionThreshold =
      resizeOptions?.renderResolutionThreshold ?? this._defaultResolutionThreshold;
    this._currentResolutionThreshold = this._stoppedCameraResolutionThreshold;

    this._resizeObserver = this.setupResizeListener(renderer);
    this._cameraManager = cameraManager;

    this._onCameraChangeCallback = () => {
      this._currentResolutionThreshold = Math.min(
        this._movingResolutionFactor * getPhysicalSize(renderer),
        this._stoppedCameraResolutionThreshold
      );
      this._shouldResize = true;
    };
    this._onCameraStopCallback = () => {
      this._currentResolutionThreshold = this._stoppedCameraResolutionThreshold;
      this._shouldResize = true;
    };

    this._renderer = renderer;
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

  public setMovingCameraResolutionFactor(factor: number): void {
    this._shouldResize = true;

    if (factor === this._movingResolutionFactor) {
      return;
    }

    if (factor <= 0 || factor > 1) {
      throw Error('movingCameraResolutionFactor must be greater than 0 and less than or equal to 1');
    }

    // If changing from factor 1, register listeners
    if (this._movingResolutionFactor === 1) {
      this._cameraManager.on('cameraChange', this._onCameraChangeCallback);
      this._cameraManager.on('cameraStop', this._onCameraStopCallback);
    } else if (factor === 1) {
      // Else, if changing to 1, unregister listeners
      this._cameraManager.off('cameraChange', this._onCameraChangeCallback);
      this._cameraManager.off('cameraStop', this._onCameraStopCallback);
    }

    this._movingResolutionFactor = factor;
  }

  public handleResize(camera: PerspectiveCamera): void {
    if (this._shouldResize) {
      this.resize(camera);
      this._shouldResize = false;
    }
  }

  private setupResizeListener(renderer: WebGLRenderer): ResizeObserver | undefined {
    const domElement = renderer.domElement.parentElement;
    if (!domElement) {
      throw new Error('Canvas does not have a parent element');
    }
    const resizeObserver = new ResizeObserver(() => (this._shouldResize = true));
    resizeObserver.observe(domElement);

    return resizeObserver;
  }

  private resize(camera: PerspectiveCamera): void {
    const canvas = this._renderer.domElement;
    const domElement = canvas.parentElement;

    if (!domElement) {
      throw new Error('Canvas does not have a parent element');
    }

    const virtualFramebufferSize = this._renderer.getSize(new Vector2());
    const pixelRatio = this._renderer.getPixelRatio();

    const domElementPhysicalNumberOfPixels = getPhysicalSize(this._renderer);

    const downScale =
      domElementPhysicalNumberOfPixels > this._currentResolutionThreshold
        ? Math.sqrt(this._currentResolutionThreshold / domElementPhysicalNumberOfPixels)
        : 1;

    const [virtualWidth, virtualHeight] = getVirtualDomElementWidthAndHeight(canvas);

    const newVirtualWidth = Math.round(virtualWidth * downScale);
    const newVirtualHeight = Math.round(virtualHeight * downScale);
    const newAspectRatio = newVirtualWidth / newVirtualHeight;

    if (camera.aspect !== newAspectRatio) {
      camera.aspect = newAspectRatio;
      camera.updateProjectionMatrix();
    }

    if (newVirtualWidth !== virtualFramebufferSize.x || newVirtualHeight !== virtualFramebufferSize.y) {
      this._renderer.setDrawingBufferSize(newVirtualWidth, newVirtualHeight, pixelRatio);
    }
  }

  dispose(): void {
    console.log('asd');
    this._resizeObserver?.unobserve(this._renderer.domElement.parentElement!);
    this._resizeObserver?.disconnect();
    this._resizeObserver = undefined;
  }
}

function getVirtualDomElementWidthAndHeight(canvas: HTMLElement): [number, number] {
  const domElement = canvas.parentElement;
  const virtualDomElementWidth = domElement?.clientWidth !== 0 ? domElement!.clientWidth : canvas.clientWidth;
  const virtualDomElementHeight = domElement?.clientHeight !== 0 ? domElement!.clientHeight : canvas.clientHeight;

  return [virtualDomElementWidth, virtualDomElementHeight];
}

function getPhysicalSize(renderer: WebGLRenderer): number {
  const canvas = renderer.domElement;
  const [virtualWidth, virtualHeight] = getVirtualDomElementWidthAndHeight(canvas);
  const pixelRatio = renderer.getPixelRatio();

  const domElementPhysicalWidth = virtualWidth * pixelRatio;
  const domElementPhysicalHeight = virtualHeight * pixelRatio;
  return domElementPhysicalWidth * domElementPhysicalHeight;
}
