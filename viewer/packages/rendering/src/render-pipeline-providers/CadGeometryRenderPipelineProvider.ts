/*!
 * Copyright 2022 Cognite AS
 */

import type { SceneHandler } from '@reveal/utilities';
import type { Object3D } from 'three';
import { Color, Vector2 } from 'three';
import type { CadMaterialManager } from '../CadMaterialManager';
import { GeometryPass } from '../render-passes/GeometryPass';
import { RenderMode } from '../rendering/RenderMode';
import type { RevealRenderer } from '../rendering/RevealRenderer';
import type { RenderOptions } from '../rendering/types';
import type { RenderPass } from '../RenderPass';
import type { RenderPipelineProvider } from '../RenderPipelineProvider';
import { createRenderTarget, hasStyledNodes } from '../utilities/renderUtilities';
import { RevealRendererStateHelper } from '../utilities/RevealRendererStateHelper';
import type { CadGeometryRenderTargets } from './types';

type CadGeometryRenderPasses = {
  back: GeometryPass;
  ghost: GeometryPass;
  inFront: GeometryPass;
};

export class CadGeometryRenderPipelineProvider implements RenderPipelineProvider {
  private readonly _cadGeometryRenderTargets: CadGeometryRenderTargets;
  private readonly _cadGeometryRenderPasses: CadGeometryRenderPasses;
  private readonly _cadModels: {
    cadNode: Object3D;
    modelIdentifier: symbol;
  }[];
  private readonly _materialManager: CadMaterialManager;
  private _rendererStateHelper: RevealRendererStateHelper | undefined;

  get cadGeometryRenderTargets(): CadGeometryRenderTargets {
    return this._cadGeometryRenderTargets;
  }

  constructor(sceneHandler: SceneHandler, materialManager: CadMaterialManager, renderOptions: RenderOptions) {
    this._cadModels = sceneHandler.cadModels;
    this._materialManager = materialManager;

    const multisampleCount = renderOptions.multiSampleCountHint ?? 0;
    this._cadGeometryRenderTargets = this.initializeRenderTargets(multisampleCount);
    this._cadGeometryRenderPasses = this.initializeRenderPasses(sceneHandler);
  }

  public *pipeline(renderer: RevealRenderer): Generator<RenderPass> {
    this.pipelineSetup(renderer);

    try {
      const modelIdentifiers = this._cadModels.map(cadModel => cadModel.modelIdentifier);
      const shouldRenderPasses = hasStyledNodes(modelIdentifiers, this._materialManager);

      renderer.setRenderTarget(this._cadGeometryRenderTargets.back);
      if (shouldRenderPasses.back) {
        yield this._cadGeometryRenderPasses.back;
      } else {
        renderer.clear();
      }

      renderer.setRenderTarget(this._cadGeometryRenderTargets.ghost);
      if (shouldRenderPasses.ghost) {
        yield this._cadGeometryRenderPasses.ghost;
      } else {
        renderer.clear();
      }

      renderer.setRenderTarget(this._cadGeometryRenderTargets.inFront);
      if (shouldRenderPasses.inFront) {
        yield this._cadGeometryRenderPasses.inFront;
      } else {
        renderer.clear();
      }
    } finally {
      this._rendererStateHelper!.resetState();
    }
  }

  public dispose(): void {
    this._cadGeometryRenderTargets.back.dispose();
    this._cadGeometryRenderTargets.ghost.dispose();
    this._cadGeometryRenderTargets.inFront.dispose();
  }

  private pipelineSetup(renderer: RevealRenderer) {
    this._rendererStateHelper = new RevealRendererStateHelper(renderer);
    this._rendererStateHelper.autoClear = true;
    this._rendererStateHelper.setClearColor(renderer.getClearColor(new Color()), 0);

    this.updateRenderTargetSizes(renderer);
  }

  private initializeRenderTargets(multisampleCount: number): CadGeometryRenderTargets {
    return {
      currentRenderSize: new Vector2(1, 1),
      back: createRenderTarget(1, 1, multisampleCount),
      ghost: createRenderTarget(1, 1, multisampleCount),
      inFront: createRenderTarget(1, 1, multisampleCount)
    };
  }

  private initializeRenderPasses(sceneHandler: SceneHandler): CadGeometryRenderPasses {
    return {
      back: new GeometryPass(sceneHandler.scene, this._materialManager, RenderMode.Color),
      ghost: new GeometryPass(sceneHandler.scene, this._materialManager, RenderMode.Ghost),
      inFront: new GeometryPass(sceneHandler.scene, this._materialManager, RenderMode.Effects)
    };
  }

  private updateRenderTargetSizes(renderer: RevealRenderer): void {
    const renderSize = new Vector2();
    renderer.getDrawingBufferSize(renderSize);

    const { x: width, y: height } = renderSize;

    const currentSize = this._cadGeometryRenderTargets.currentRenderSize;
    if (width === currentSize.x && height === currentSize.y) {
      return;
    }

    this._cadGeometryRenderTargets.back.setSize(width, height);
    this._cadGeometryRenderTargets.ghost.setSize(width, height);
    this._cadGeometryRenderTargets.inFront.setSize(width, height);

    this._cadGeometryRenderTargets.currentRenderSize.set(width, height);
  }
}
