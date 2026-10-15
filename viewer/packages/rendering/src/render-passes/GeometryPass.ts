/*!
 * Copyright 2022 Cognite AS
 */

import type { Camera, Object3D, WebGLRenderer } from 'three';
import type { CadMaterialManager } from '../CadMaterialManager';
import { RenderMode } from '../rendering/RenderMode';
import type { RenderPass } from '../RenderPass';
import { getLayerMask } from '../utilities/renderUtilities';

export class GeometryPass implements RenderPass {
  private readonly _geometryScene: Object3D;
  private readonly _materialManager: CadMaterialManager;
  private readonly _renderMode: RenderMode;
  private readonly _overrideRenderLayer: number | undefined;
  private readonly _renderLayer: number;

  constructor(
    scene: Object3D,
    materialManager: CadMaterialManager,
    renderMode: RenderMode = RenderMode.Color,
    overrideLayerMask?: number
  ) {
    this._geometryScene = scene;
    this._renderMode = renderMode;
    this._materialManager = materialManager;
    this._overrideRenderLayer = overrideLayerMask;
    this._renderLayer = this._overrideRenderLayer ?? getLayerMask(this._renderMode);
  }

  public render(renderer: WebGLRenderer, camera: Camera): void {
    const currentCameraMask = camera.layers.mask;
    let renderMode: RenderMode = this._renderMode;
    try {
      camera.layers.mask = this._renderLayer;
      renderMode = this._materialManager.getRenderMode();
      this._materialManager.setRenderMode(this._renderMode);
      // Depth, picking and the shadow map do not shade with the sun.
      if (
        this._renderMode === RenderMode.Color ||
        this._renderMode === RenderMode.Ghost ||
        this._renderMode === RenderMode.Effects
      ) {
        this._materialManager.updateViewLighting(camera);
      }
      renderer.render(this._geometryScene, camera);
    } finally {
      camera.layers.mask = currentCameraMask;
      this._materialManager.setRenderMode(renderMode);
    }
  }
}
