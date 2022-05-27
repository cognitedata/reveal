/*!
 * Copyright 2022 Cognite AS
 */

import * as THREE from 'three';
import { CadMaterialManager } from '../CadMaterialManager';
import { GeometryPass } from '../render-passes/GeometryPass';
import { RenderPass } from '../RenderPass';
import { RenderPipelineProvider } from '../RenderPipelineProvider';
import { getLayerMask, RenderLayer, setupCadModelsGeometryLayers } from '../utilities/renderUtilities';
import { RenderMode } from '../rendering/RenderMode';
import { SceneHandler } from '@reveal/utilities';

export class CadGeometryRenderModePipelineProvider implements RenderPipelineProvider {
  private readonly _materialManager: CadMaterialManager;
  private readonly _cadModels: {
    object: THREE.Object3D<THREE.Event>;
    modelIdentifier: string;
  }[];
  private readonly _renderTargetData: { currentRenderSize: THREE.Vector2 };
  private readonly _geometryPass: GeometryPass;
  private _outputRenderTarget: THREE.WebGLRenderTarget | null = null;
  private _autoSizeRenderTarget = false;

  public readonly scene: THREE.Scene;

  constructor(renderMode: RenderMode, materialManager: CadMaterialManager, sceneHandler: SceneHandler) {
    this.scene = sceneHandler.scene;
    this._materialManager = materialManager;
    this._cadModels = sceneHandler.cadModels;
    this._renderTargetData = {
      currentRenderSize: new THREE.Vector2(1, 1)
    };

    const layerMask = getLayerMask(RenderLayer.InFront) | getLayerMask(RenderLayer.Back);
    this._geometryPass = new GeometryPass(sceneHandler.scene, materialManager, renderMode, layerMask);
  }

  // TODO 2022-05-11 christjt: This should ideally set in the constructor,
  // but this is hard since it is initialized before v8 sector culler
  // which creates the render target
  public setOutputRenderTarget(target: THREE.WebGLRenderTarget | null, autoSizeRenderTarget = true): void {
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
