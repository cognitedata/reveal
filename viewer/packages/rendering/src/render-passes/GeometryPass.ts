/*!
 * Copyright 2022 Cognite AS
 */

import * as THREE from 'three';
import { CadMaterialManager } from '../CadMaterialManager';
import { RenderMode } from '../rendering/RenderMode';
import { RenderPass } from '../RenderPass';

export class GeometryPass implements RenderPass {
  private readonly _geometryScene: THREE.Object3D;
  private readonly _renderTarget: THREE.WebGLRenderTarget;
  private readonly _materialManager: CadMaterialManager;
  private readonly _renderMode: RenderMode;
  private readonly _overrideRenderLayer: number;

  constructor(
    scene: THREE.Object3D,
    materialManager: CadMaterialManager,
    renderMode = RenderMode.Color,
    overrideRenderLayer?: number
  ) {
    this._geometryScene = scene;
    this._renderMode = renderMode;
    this._materialManager = materialManager;
    this._overrideRenderLayer = overrideRenderLayer;
  }

  public getOutputRenderTarget(): THREE.WebGLRenderTarget | null {
    return this._renderTarget;
  }

  public render(renderer: THREE.WebGLRenderer, camera: THREE.Camera): Promise<THREE.WebGLRenderTarget> {
    const renderLayer = this._overrideRenderLayer ?? this._renderMode;
    camera.layers.set(renderLayer);
    this._materialManager.setRenderMode(this._renderMode);
    renderer.render(this._geometryScene, camera);
    return;
  }
}
