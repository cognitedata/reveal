/*!
 * Copyright 2022 Cognite AS
 */

import * as THREE from 'three';
import { CadMaterialManager } from '../CadMaterialManager';
import { GeometryPass } from '../render-passes/GeometryPass';
import { RenderMode } from '../rendering/RenderMode';
import { RenderOptions } from '../rendering/types';
import { RenderPass } from '../RenderPass';
import { RenderPipelineProvider } from '../RenderPipelineProvider';
import { createRenderTarget, setupCadModelsGeometryLayers } from '../utilities/renderUtilities';
import { IdentifiedModel } from '../utilities/types';
import { CadGeometryRenderTargets } from './types';

type CadGeometryRenderPasses = {
  back: GeometryPass;
  ghost: GeometryPass;
  inFront: GeometryPass;
};

type RenderState = {
  autoClear: boolean;
  clearColor: THREE.Color;
  clearAlpha: number;
};

export class CadGeometryRenderPipeline implements RenderPipelineProvider {
  private readonly _cadGeometryRenderTargets: CadGeometryRenderTargets;
  private readonly _cadGeometryRenderPasses: CadGeometryRenderPasses;
  private readonly _cadModels: IdentifiedModel[];
  private _currentRendererState: RenderState;
  private readonly _materialManager: CadMaterialManager;

  get cadGeometryRenderTargets(): CadGeometryRenderTargets {
    return this._cadGeometryRenderTargets;
  }

  constructor(
    scene: THREE.Scene,
    cadModels: IdentifiedModel[],
    materialManager: CadMaterialManager,
    renderOptions: RenderOptions
  ) {
    this._cadModels = cadModels;
    this._materialManager = materialManager;

    const multisampleCount = renderOptions.multiSampleCountHint ?? 0;
    this._cadGeometryRenderTargets = this.initializeRenderTargets(multisampleCount);
    this._cadGeometryRenderPasses = this.initializeRenderPasses(scene);
  }

  public *pipeline(renderer: THREE.WebGLRenderer): Generator<RenderPass> {
    this.pipelineSetup(renderer);

    renderer.setRenderTarget(this._cadGeometryRenderTargets.back);
    yield this._cadGeometryRenderPasses.back;

    renderer.setRenderTarget(this._cadGeometryRenderTargets.ghost);
    yield this._cadGeometryRenderPasses.ghost;

    renderer.setRenderTarget(this._cadGeometryRenderTargets.inFront);
    yield this._cadGeometryRenderPasses.inFront;

    this.pipelineTearDown(renderer);
  }

  public dispose(): void {}

  private pipelineSetup(renderer: THREE.WebGLRenderer) {
    this._currentRendererState = {
      autoClear: renderer.autoClear,
      clearColor: renderer.getClearColor(new THREE.Color()),
      clearAlpha: renderer.getClearAlpha()
    };

    renderer.autoClear = true;
    renderer.setClearColor(this._currentRendererState.clearColor);
    renderer.setClearAlpha(0.0);

    this.updateRenderTargetSizes(renderer);
    setupCadModelsGeometryLayers(this._materialManager, this._cadModels);
  }

  private pipelineTearDown(renderer: THREE.WebGLRenderer) {
    renderer.autoClear = this._currentRendererState.autoClear;
    renderer.setClearColor(this._currentRendererState.clearColor);
    renderer.setClearAlpha(this._currentRendererState.clearAlpha);
  }

  private initializeRenderTargets(multisampleCount: number): CadGeometryRenderTargets {
    return {
      currentRenderSize: new THREE.Vector2(1, 1),
      back: createRenderTarget(1, 1, multisampleCount),
      ghost: createRenderTarget(1, 1, multisampleCount),
      inFront: createRenderTarget(1, 1, multisampleCount)
    };
  }

  private initializeRenderPasses(scene: THREE.Scene): CadGeometryRenderPasses {
    return {
      back: new GeometryPass(scene, this._materialManager, RenderMode.Color),
      ghost: new GeometryPass(scene, this._materialManager, RenderMode.Ghost),
      inFront: new GeometryPass(scene, this._materialManager, RenderMode.Effects)
    };
  }

  private updateRenderTargetSizes(renderer: THREE.WebGLRenderer): void {
    const renderSize = new THREE.Vector2();
    renderer.getSize(renderSize);

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
