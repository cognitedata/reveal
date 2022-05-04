/*!
 * Copyright 2022 Cognite AS
 */

import * as THREE from 'three';
import { CadMaterialManager } from '../CadMaterialManager';
import { GeometryPass } from '../render-passes/GeometryPass';
import { RenderPass } from '../RenderPass';
import { RenderPipelineProvider } from '../RenderPipelineProvider';
import { getLayerMask, RenderLayer, setupGeometryLayers } from '../utilities/renderUtilities';
import { IdentifiedModel } from '../utilities/types';
import { RenderMode } from '../rendering/RenderMode';
import { WebGLRenderTarget } from 'three';

export class GeometryDepthRenderPipeline implements RenderPipelineProvider {
  private readonly _materialManager: CadMaterialManager;
  private readonly _cadModels: IdentifiedModel[];
  private readonly _renderTargetData: { currentRenderSize: THREE.Vector2 };
  private readonly _geometryPass: GeometryPass;
  private _outputRenderTarget: THREE.WebGLRenderTarget = null;
  public scene: THREE.Scene;
  private readonly _autoSizeRenderTarget: boolean;

  set outputRenderTarget(target: THREE.WebGLRenderTarget) {
    this._outputRenderTarget = target;
  }

  get outputRenderTarget(): WebGLRenderTarget {
    return this._outputRenderTarget;
  }

  constructor(
    renderMode: RenderMode,
    materialManager: CadMaterialManager,
    scene: THREE.Scene,
    cadModels?: IdentifiedModel[],
    autoSizeRenderTarget = true
  ) {
    this.scene = scene;
    this._materialManager = materialManager;
    this._cadModels = cadModels;
    this._autoSizeRenderTarget = autoSizeRenderTarget;
    this._renderTargetData = {
      currentRenderSize: new THREE.Vector2(1, 1)
    };

    const layerMask = getLayerMask(RenderLayer.InFront) | getLayerMask(RenderLayer.Back);
    this._geometryPass = new GeometryPass(scene, materialManager, renderMode, layerMask);
  }

  public *pipeline(renderer: THREE.WebGLRenderer): Generator<RenderPass> {
    this.updateRenderTargetSizes(renderer);
    setupGeometryLayers(this._materialManager, this._cadModels);
    renderer.setRenderTarget(this._outputRenderTarget);
    yield this._geometryPass;
  }

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
