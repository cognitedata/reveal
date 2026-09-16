/*!
 * Copyright 2022 Cognite AS
 */

import type { Scene, WebGLRenderTarget, WebGLRenderer } from 'three';
import { Vector2 } from 'three';
import type { CadMaterialManager } from '../CadMaterialManager';
import { GeometryPass } from '../render-passes/GeometryPass';
import type { RenderPass } from '../RenderPass';
import type { RenderPipelineProvider } from '../RenderPipelineProvider';
import { getLayerMask, RenderLayer } from '../utilities/renderUtilities';
import type { RenderMode } from '../rendering/RenderMode';
import type { SceneHandler } from '@reveal/utilities';
import type { SettableRenderTarget } from '../rendering/SettableRenderTarget';

export class CadGeometryRenderModePipelineProvider implements RenderPipelineProvider, SettableRenderTarget {
  private readonly _renderTargetData: { currentRenderSize: Vector2 };
  private readonly _geometryPass: GeometryPass;
  private _outputRenderTarget: WebGLRenderTarget | null = null;
  private _autoSizeRenderTarget = false;

  public readonly scene: Scene;

  constructor(renderMode: RenderMode, materialManager: CadMaterialManager, sceneHandler: SceneHandler) {
    this.scene = sceneHandler.scene;
    this._renderTargetData = {
      currentRenderSize: new Vector2(1, 1)
    };

    const layerMask = getLayerMask(RenderLayer.InFront) | getLayerMask(RenderLayer.Back);
    this._geometryPass = new GeometryPass(sceneHandler.scene, materialManager, renderMode, layerMask);
  }

  public setOutputRenderTarget(target: WebGLRenderTarget | null, autoSizeRenderTarget = true): void {
    this._outputRenderTarget = target;
    this._autoSizeRenderTarget = autoSizeRenderTarget;
  }

  public *pipeline(renderer: WebGLRenderer): Generator<RenderPass> {
    this.updateRenderTargetSizes(renderer);
    renderer.setRenderTarget(this._outputRenderTarget);
    yield this._geometryPass;
  }

  public dispose(): void {}

  private updateRenderTargetSizes(renderer: WebGLRenderer): void {
    const renderSize = new Vector2();
    renderer.getDrawingBufferSize(renderSize);

    const { x: width, y: height } = renderSize;

    const currentSize = this._renderTargetData.currentRenderSize;
    if ((width === currentSize.x && height === currentSize.y) || !this._autoSizeRenderTarget) {
      return;
    }

    this._renderTargetData.currentRenderSize.set(width, height);
  }
}
