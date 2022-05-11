/*!
 * Copyright 2022 Cognite AS
 */

import * as THREE from 'three';
import { CadMaterialManager } from '../CadMaterialManager';
import { GeometryPass } from '../render-passes/GeometryPass';
import { RenderPass } from '../RenderPass';
import { RenderPipelineProvider } from '../RenderPipelineProvider';
import { getLayerMask, RenderLayer, setupCadModelsGeometryLayers } from '../utilities/renderUtilities';
import { IdentifiedModel } from '../utilities/types';
import { RenderMode } from '../rendering/RenderMode';

export class CadGeometryCustomRenderModePipeline implements RenderPipelineProvider {
  private readonly _materialManager: CadMaterialManager;
  private readonly _cadModels: IdentifiedModel[];
  private readonly _renderTargetData: { currentRenderSize: THREE.Vector2 };
  private readonly _geometryPass: GeometryPass;
  private _outputRenderTarget: THREE.WebGLRenderTarget = null;
  private _autoSizeRenderTarget = false;

  public scene: THREE.Scene;

  constructor(
    renderMode: RenderMode,
    materialManager: CadMaterialManager,
    scene: THREE.Scene,
    cadModels?: IdentifiedModel[]
  ) {
    this.scene = scene;
    this._materialManager = materialManager;
    this._cadModels = cadModels;
    this._renderTargetData = {
      currentRenderSize: new THREE.Vector2(1, 1)
    };

    const layerMask = getLayerMask(RenderLayer.InFront) | getLayerMask(RenderLayer.Back);
    this._geometryPass = new GeometryPass(scene, materialManager, renderMode, layerMask);
  }

  // TODO 2022-05-11 christjt: This should ideally set in the constructor,
  // but this is hard since it is initialized before v8 sector culler
  // which creates the render target
  public setOutputRenderTarget(target: THREE.WebGLRenderTarget, autoSizeRenderTarget = true): void {
    this._outputRenderTarget = target;
    this._autoSizeRenderTarget = autoSizeRenderTarget;
  }

  public *pipeline(renderer: THREE.WebGLRenderer): Generator<RenderPass> {
    this.updateRenderTargetSizes(renderer);
    setupCadModelsGeometryLayers(this._materialManager, this._cadModels);
    renderer.setRenderTarget(this._outputRenderTarget);
    yield this._geometryPass;
  }

  public dispose(): void {}

  private updateRenderTargetSizes(renderer: THREE.WebGLRenderer): void {
    const renderSize = new THREE.Vector2();
    renderer.getSize(renderSize);

    const { x: width, y: height } = renderSize;

    const currentSize = this._renderTargetData.currentRenderSize;
    if ((width === currentSize.x && height === currentSize.y) || !this._autoSizeRenderTarget) {
      return;
    }

    this._renderTargetData.currentRenderSize.set(width, height);
  }
}
