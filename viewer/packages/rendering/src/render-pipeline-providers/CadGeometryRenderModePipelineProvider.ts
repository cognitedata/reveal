/*!
 * Copyright 2022 Cognite AS
 */

import type { RenderTarget, Scene } from 'three';
import { Vector2 } from 'three';
import type { CadMaterialManager } from '../CadMaterialManager';
import { GeometryPass } from '../render-passes/GeometryPass';
import type { RenderPass } from '../RenderPass';
import type { RenderPipelineProvider } from '../RenderPipelineProvider';
import { getLayerMask, RenderLayer } from '../utilities/renderUtilities';
import type { RenderMode } from '../rendering/RenderMode';
import type { RevealRenderer } from '../rendering/RevealRenderer';
import type { SceneHandler } from '@reveal/utilities';
import type { SettableRenderTarget } from '../rendering/SettableRenderTarget';

export class CadGeometryRenderModePipelineProvider implements RenderPipelineProvider, SettableRenderTarget {
  private readonly _renderTargetData: { currentRenderSize: Vector2 };
  private readonly _geometryPass: GeometryPass;
  private _outputRenderTarget: RenderTarget | null = null;
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

  public setOutputRenderTarget(target: RenderTarget | null, autoSizeRenderTarget = true): void {
    this._outputRenderTarget = target;
    this._autoSizeRenderTarget = autoSizeRenderTarget;
  }

  public *pipeline(renderer: RevealRenderer): Generator<RenderPass> {
    this.updateRenderTargetSizes(renderer);
    renderer.setRenderTarget(this._outputRenderTarget);
    yield this._geometryPass;
  }

  public dispose(): void {}

  private updateRenderTargetSizes(renderer: RevealRenderer): void {
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
