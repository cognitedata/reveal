/*!
 * Copyright 2022 Cognite AS
 */

import * as THREE from 'three';
import { CadMaterialManager } from '../CadMaterialManager';
import { RenderMode } from '../rendering/RenderMode';
import { RenderPass } from '../RenderPass';
import { getLayerMask } from '../utilities/renderUtilities';

export class GeometryPass implements RenderPass {
  private readonly _geometryScene: THREE.Object3D;
  private readonly _materialManager: CadMaterialManager;
  private readonly _renderMode: RenderMode;
  private readonly _overrideRenderLayer: number | undefined;
  private readonly _renderLayer: number;

  constructor(
    scene: THREE.Object3D,
    materialManager: CadMaterialManager,
    renderMode = RenderMode.Color,
    overrideLayerMask?: number
  ) {
    this._geometryScene = scene;
    this._renderMode = renderMode;
    this._materialManager = materialManager;
    this._overrideRenderLayer = overrideLayerMask;
    this._renderLayer = this._overrideRenderLayer ?? getLayerMask(this._renderMode);
  }

  public render(renderer: THREE.WebGLRenderer, camera: THREE.Camera): void {
    const currentCameraMask = camera.layers.mask;
    try {
      camera.layers.mask = this._renderLayer;
      this._materialManager.setRenderMode(this._renderMode);
      renderer.render(this._geometryScene, camera);
    } finally {
      camera.layers.mask = currentCameraMask;
    }
  }
}
