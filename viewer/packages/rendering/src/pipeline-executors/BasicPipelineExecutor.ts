/*!
 * Copyright 2022 Cognite AS
 */

import * as THREE from 'three';
import { RenderPipelineExecutor } from '../RenderPipelineExecutor';
import { RenderPipelineProvider } from '../RenderPipelineProvider';

export type BasicPipelineExecutorOptions = {
  autoResizeRenderer: boolean;
  resolutionThreshold?: number;
};

export class BasicPipelineExecutor implements RenderPipelineExecutor {
  private readonly _defaultResolutionThreshold = 1.4e6;

  private readonly _renderer: THREE.WebGLRenderer;
  private readonly _resolutionThreshold: number;
  private readonly _resizeObserver: ResizeObserver | undefined;

  private _shouldResize: boolean;

  constructor(renderer: THREE.WebGLRenderer, options?: BasicPipelineExecutorOptions) {
    this._renderer = renderer;
    this._resolutionThreshold = options?.resolutionThreshold ?? this._defaultResolutionThreshold;

    const autoResizeRenderer = options?.autoResizeRenderer ?? false;
    this._shouldResize = autoResizeRenderer;

    this._resizeObserver = this.setupResizeListener(autoResizeRenderer, renderer);

    renderer.info.autoReset = false;
  }

  public render(renderPipeline: RenderPipelineProvider, camera: THREE.PerspectiveCamera): void {
    this._renderer.info.reset();

    if (this._shouldResize) {
      this.resize(camera);
      this._shouldResize = false;
    }

    for (const renderPass of renderPipeline.pipeline(this._renderer)) {
      renderPass.render(this._renderer, camera);
    }
  }

  private setupResizeListener(autoResizeRenderer: boolean, renderer: THREE.WebGLRenderer): ResizeObserver | undefined {
    if (!autoResizeRenderer) {
      return;
    }
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

    const virtualFramebufferSize = this._renderer.getSize(new THREE.Vector2());
    const pixelRatio = this._renderer.getPixelRatio();

    const virtualDomElementWidth = domElement.clientWidth !== 0 ? domElement.clientWidth : canvas.clientWidth;

    const virtualDomElementHeight = domElement.clientHeight !== 0 ? domElement.clientHeight : canvas.clientHeight;

    const domElementPhysicalWidth = virtualDomElementWidth * pixelRatio;
    const domElementPhysicalHeight = virtualDomElementHeight * pixelRatio;
    const domElementPhysicalNumberOfPixels = domElementPhysicalWidth * domElementPhysicalHeight;

    const downScale =
      domElementPhysicalNumberOfPixels > this._resolutionThreshold
        ? Math.sqrt(this._resolutionThreshold / domElementPhysicalNumberOfPixels)
        : 1;

    const newVirtualWidth = Math.round(virtualDomElementWidth * downScale);
    const newVirtualHeight = Math.round(virtualDomElementHeight * downScale);
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
    this._resizeObserver?.disconnect();
  }
}
