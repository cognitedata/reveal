/*!
 * Copyright 2022 Cognite AS
 */

import { SceneHandler, WebGLRendererStateHelper } from '@reveal/utilities';
import * as THREE from 'three';
import { CadMaterialManager } from '../CadMaterialManager';
import { GeometryPass } from '../render-passes/GeometryPass';
import { RenderMode } from '../rendering/RenderMode';
import { RenderOptions } from '../rendering/types';
import { RenderPass } from '../RenderPass';
import { RenderPipelineProvider } from '../RenderPipelineProvider';
import { createRenderTarget, hasStyledNodes, setupCadModelsGeometryLayers } from '../utilities/renderUtilities';
import { CadGeometryRenderTargets } from './types';

type CadGeometryRenderPasses = {
  back: GeometryPass;
  ghost: GeometryPass;
  inFront: GeometryPass;
};

export class CadGeometryRenderPipelineProvider implements RenderPipelineProvider {
  private readonly _cadGeometryRenderTargets: CadGeometryRenderTargets;
  private readonly _cadGeometryRenderPasses: CadGeometryRenderPasses;
  private readonly _cadModels: {
    object: THREE.Object3D<THREE.Event>;
    modelIdentifier: string;
  }[];
  private readonly _materialManager: CadMaterialManager;
  private _rendererStateHelper: WebGLRendererStateHelper | undefined;

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

  public *pipeline(renderer: THREE.WebGLRenderer): Generator<RenderPass> {
    this.pipelineSetup(renderer);

    try {
      const modelIdentifiers = this._cadModels.map(cadModel => cadModel.modelIdentifier);
      const shouldRenderPasses = hasStyledNodes(modelIdentifiers, this._materialManager);

      if (shouldRenderPasses.back) {
        renderer.setRenderTarget(this._cadGeometryRenderTargets.back);
        yield this._cadGeometryRenderPasses.back;
      }

      if (shouldRenderPasses.ghost) {
        renderer.setRenderTarget(this._cadGeometryRenderTargets.ghost);
        yield this._cadGeometryRenderPasses.ghost;
      }

      if (shouldRenderPasses.inFront) {
        renderer.setRenderTarget(this._cadGeometryRenderTargets.inFront);
        yield this._cadGeometryRenderPasses.inFront;
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

  private pipelineSetup(renderer: THREE.WebGLRenderer) {
    this._rendererStateHelper = new WebGLRendererStateHelper(renderer);
    this._rendererStateHelper.autoClear = true;
    this._rendererStateHelper.setClearColor(renderer.getClearColor(new THREE.Color()), 0);

    this.updateRenderTargetSizes(renderer);
    setupCadModelsGeometryLayers(this._materialManager, this._cadModels);
  }

  private initializeRenderTargets(multisampleCount: number): CadGeometryRenderTargets {
    return {
      currentRenderSize: new THREE.Vector2(1, 1),
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
