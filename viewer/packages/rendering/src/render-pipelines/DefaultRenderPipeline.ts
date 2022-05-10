/*!
 * Copyright 2022 Cognite AS
 */

import * as THREE from 'three';
import cloneDeep from 'lodash/cloneDeep';
import { CadMaterialManager } from '../CadMaterialManager';
import { RenderPass } from '../RenderPass';
import { RenderPipelineProvider } from '../RenderPipelineProvider';
import { createRenderTarget } from '../utilities/renderUtilities';
import { IdentifiedModel } from '../utilities/types';
import { RenderTargetData } from './types';
import { BlitEffect } from '../render-passes/types';
import { AntiAliasingMode, defaultRenderOptions, RenderOptions } from '../rendering/types';
import { CadGeometryRenderPipeline } from './CadGeometryRenderPipeline';
import { PostProcessingPipeline } from './PostProcessingPipeline';
import { BlitPass } from '../render-passes/BlitPass';
import { SSAOPass } from '../render-passes/SSAOPass';

export class DefaultRenderPipeline implements RenderPipelineProvider {
  private readonly _cadScene: THREE.Scene;
  private readonly _renderTargetData: RenderTargetData;
  private readonly _cadModels: IdentifiedModel[];
  private readonly _customObjects: THREE.Object3D[];
  private readonly _autoResizeOutputTarget: boolean;
  private readonly _outputRenderTarget: THREE.WebGLRenderTarget;
  private _currentRendererState: {
    autoClear: boolean;
    clearColor: THREE.Color;
    clearAlpha: number;
  };
  private readonly _cadGeometryRenderPipeline: CadGeometryRenderPipeline;
  private readonly _postProcessingRenderPipeline: PostProcessingPipeline;
  private readonly _blitToScreenPass: BlitPass;
  private readonly _ssaoPass: SSAOPass;

  set renderOptions(renderOptions: RenderOptions) {
    const { ssaoRenderParameters } = renderOptions;
    this._ssaoPass.ssaoParameters = ssaoRenderParameters ?? defaultRenderOptions.ssaoRenderParameters;

    const blitEffect =
      AntiAliasingMode[renderOptions.antiAliasing] === AntiAliasingMode[AntiAliasingMode.FXAA]
        ? BlitEffect.Fxaa
        : BlitEffect.None;
    this._blitToScreenPass.blitEffect = blitEffect;
  }

  constructor(
    materialManager: CadMaterialManager,
    scene: THREE.Scene,
    renderOptions: RenderOptions,
    cadModels?: IdentifiedModel[],
    customObjects?: THREE.Object3D[],
    outputRenderTarget?: {
      target: THREE.WebGLRenderTarget;
      autoSize?: boolean;
    }
  ) {
    this._cadScene = scene;
    this._autoResizeOutputTarget = outputRenderTarget?.autoSize ?? true;
    this._outputRenderTarget = outputRenderTarget?.target ?? null;

    this._renderTargetData = {
      currentRenderSize: new THREE.Vector2(1, 1),
      ssaoRenderTarget: createRenderTarget(),
      postProcessingRenderTarget: createRenderTarget()
    };
    this._cadModels = cadModels;
    this._customObjects = customObjects;

    const ssaoParameters = renderOptions.ssaoRenderParameters ?? defaultRenderOptions.ssaoRenderParameters;
    const edges = renderOptions.edgeDetectionParameters ?? defaultRenderOptions.edgeDetectionParameters;

    this._cadGeometryRenderPipeline = new CadGeometryRenderPipeline(scene, cadModels, materialManager, renderOptions);
    this._ssaoPass = new SSAOPass(
      this._cadGeometryRenderPipeline.cadGeometryRenderTargets.back.depthTexture,
      ssaoParameters
    );

    this._postProcessingRenderPipeline = new PostProcessingPipeline(
      {
        ssaoTexture: this._renderTargetData.ssaoRenderTarget.texture,
        edges: edges.enabled,
        ...this._cadGeometryRenderPipeline.cadGeometryRenderTargets
      },
      customObjects
    );

    this._blitToScreenPass = new BlitPass({
      texture: this._renderTargetData.postProcessingRenderTarget.texture,
      depthTexture: this._renderTargetData.postProcessingRenderTarget.depthTexture
    });

    this.renderOptions = cloneDeep(renderOptions);
  }

  public *pipeline(renderer: THREE.WebGLRenderer): Generator<RenderPass> {
    this.pipelineSetup(renderer);

    yield* this._cadGeometryRenderPipeline.pipeline(renderer);

    renderer.setRenderTarget(this._renderTargetData.ssaoRenderTarget);
    renderer.setClearColor('#FFFFFF');
    renderer.setClearAlpha(1.0);
    renderer.clear();
    yield this._ssaoPass;

    renderer.setRenderTarget(this._renderTargetData.postProcessingRenderTarget);
    renderer.setClearColor(this._currentRendererState.clearColor);
    renderer.setClearAlpha(this._currentRendererState.clearAlpha);
    renderer.clear();
    yield this._postProcessingRenderPipeline;

    renderer.setRenderTarget(this._outputRenderTarget);
    yield this._blitToScreenPass;

    this.pipelineTearDown(renderer);
  }

  private pipelineTearDown(renderer: THREE.WebGLRenderer) {
    renderer.autoClear = this._currentRendererState.autoClear;
    renderer.setClearColor(this._currentRendererState.clearColor);
    renderer.setClearAlpha(this._currentRendererState.clearAlpha);
  }

  private pipelineSetup(renderer: THREE.WebGLRenderer) {
    this._currentRendererState = {
      autoClear: renderer.autoClear,
      clearColor: renderer.getClearColor(new THREE.Color()),
      clearAlpha: renderer.getClearAlpha()
    };

    renderer.sortObjects = false;
    renderer.autoClear = false;
    renderer.setClearColor(this._currentRendererState.clearColor);
    renderer.setClearAlpha(0.0);

    this._cadModels?.forEach(identifiedModel => {
      identifiedModel.model.matrixAutoUpdate = false;
    });
    this._cadScene.autoUpdate = false;

    this._customObjects?.forEach(customObject => customObject.updateMatrixWorld(true));

    this.updateRenderTargetSizes(renderer);
  }

  private updateRenderTargetSizes(renderer: THREE.WebGLRenderer): void {
    const renderSize = new THREE.Vector2();
    renderer.getSize(renderSize);

    const { x: width, y: height } = renderSize;

    const currentSize = this._renderTargetData.currentRenderSize;
    if (width === currentSize.x && height === currentSize.y) {
      return;
    }

    this._renderTargetData.postProcessingRenderTarget.setSize(width, height);
    this._renderTargetData.ssaoRenderTarget.setSize(width, height);
    this._renderTargetData.currentRenderSize.set(width, height);

    if (this._outputRenderTarget !== null && this._autoResizeOutputTarget) {
      this._outputRenderTarget.setSize(width, height);
    }
  }
}
