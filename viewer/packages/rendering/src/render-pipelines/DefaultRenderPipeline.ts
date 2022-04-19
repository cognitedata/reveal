/*!
 * Copyright 2022 Cognite AS
 */

import * as THREE from 'three';
import cloneDeep from 'lodash/cloneDeep';
import { CadMaterialManager } from '../CadMaterialManager';
import { BlitPass } from '../render-passes/BlitPass';
import { GeometryPass } from '../render-passes/GeometryPass';
import { EdgeDetectPass } from '../render-passes/EdgeDetectPass';
import { SSAOPass } from '../render-passes/SSAOPass';
import { RenderMode } from '../rendering/RenderMode';
import { RenderPass } from '../RenderPass';
import { RenderPipelineProvider } from '../RenderPipelineProvider';
import { createRenderTarget, getLayerMask, RenderLayer, setupGeometryLayers } from '../utilities/renderUtilities';
import { OutlinePass } from '../render-passes/OutlinePass';
import { IdentifiedModel } from '../utilities/types';
import { DefaultRenderPipelinePasses, RenderTargetData } from './types';
import { BlitEffect, alphaMaskBlendOptions, transparentBlendOptions } from '../render-passes/types';
import { AntiAliasingMode, defaultRenderOptions, RenderOptions } from '../rendering/types';

export class DefaultRenderPipeline implements RenderPipelineProvider {
  private readonly _materialManager: CadMaterialManager;
  private readonly _cadScene: THREE.Scene;
  private readonly _renderTargetData: RenderTargetData;
  private readonly _cadModels: IdentifiedModel[];
  private readonly _customObjects: THREE.Object3D[];
  private readonly _defaultRenderPipelinePasses: DefaultRenderPipelinePasses;
  private _renderOptions: RenderOptions;
  private _outputRenderTarget: { target: THREE.WebGLRenderTarget; autoUpdateSize: boolean } = {
    target: null,
    autoUpdateSize: true
  };
  private _currentRendererState: {
    autoClear: boolean;
    clearColor: THREE.Color;
    clearAlpha: number;
  };

  set renderOptions(renderOptions: RenderOptions) {
    const { ssaoRenderParameters } = renderOptions;
    this._defaultRenderPipelinePasses.back.ssao.ssaoParameters = ssaoRenderParameters;

    if (renderOptions.antiAliasing !== this._renderOptions.antiAliasing) {
      const blitEffect =
        AntiAliasingMode[renderOptions.antiAliasing] === AntiAliasingMode[AntiAliasingMode.FXAA]
          ? BlitEffect.Fxaa
          : BlitEffect.None;
      this._defaultRenderPipelinePasses.blitToOutput.blitEffect = blitEffect;
    }

    this._renderOptions = cloneDeep(renderOptions);
  }

  get outputRenderTarget(): { target: THREE.WebGLRenderTarget; autoUpdateSize: boolean } {
    return this._outputRenderTarget;
  }

  public setOutputRenderTarget(renderTarget: THREE.WebGLRenderTarget, autoUpdateSize = true): void {
    this._outputRenderTarget = { target: renderTarget, autoUpdateSize: autoUpdateSize };
  }

  constructor(
    materialManager: CadMaterialManager,
    scene: THREE.Scene,
    renderOptions: RenderOptions,
    cadModels?: IdentifiedModel[],
    customObjects?: THREE.Object3D[]
  ) {
    const multisampleCount = renderOptions.multiSampleCountHint ?? 0;

    this._materialManager = materialManager;
    this._cadScene = scene;
    this._renderTargetData = {
      currentRenderSize: new THREE.Vector2(1, 1),
      backComposition: createRenderTarget(),
      opaqueComposition: createRenderTarget(),
      finalComposition: createRenderTarget(),
      color: createRenderTarget(1, 1, multisampleCount),
      ghost: createRenderTarget(1, 1, multisampleCount),
      inFront: createRenderTarget(1, 1, multisampleCount),
      ssao: new THREE.WebGLRenderTarget(1, 1)
    };
    this._cadModels = cadModels;
    this._customObjects = customObjects;
    this._renderOptions = cloneDeep(renderOptions);

    this._defaultRenderPipelinePasses = this.initializeRenderPasses(renderOptions);
  }

  public *pipeline(renderer: THREE.WebGLRenderer): Generator<RenderPass> {
    this.pipelineSetup(renderer);
    setupGeometryLayers(this._materialManager, this._cadModels, this._customObjects);

    yield* this.renderInFront(renderer);

    yield* this.renderBack(renderer);

    renderer.setRenderTarget(this._renderTargetData.opaqueComposition);
    yield this._defaultRenderPipelinePasses.blitOpaque;

    renderer.setClearColor(this._currentRendererState.clearColor);
    renderer.setClearAlpha(this._currentRendererState.clearAlpha);
    renderer.setRenderTarget(this._renderTargetData.finalComposition);
    renderer.clear();
    yield this._defaultRenderPipelinePasses.blitComposite;

    yield* this.renderCustom(renderer);

    yield* this.renderGhosted(renderer);

    yield* this.renderDeferredCustom(renderer);

    yield* this.blitToCanvas(renderer);

    this.pipelineTearDown(renderer);
  }

  private *blitToCanvas(renderer: THREE.WebGLRenderer) {
    const blitToOutput = this._defaultRenderPipelinePasses.blitToOutput;
    renderer.setRenderTarget(this._outputRenderTarget.target);
    renderer.clear();
    yield blitToOutput;
  }

  private *renderDeferredCustom(renderer: THREE.WebGLRenderer) {
    const { deferred } = this._defaultRenderPipelinePasses.custom;
    renderer.setRenderTarget(this._renderTargetData.finalComposition);
    yield deferred;
  }

  private *renderGhosted(renderer: THREE.WebGLRenderer) {
    const { geometry, blitToComposition } = this._defaultRenderPipelinePasses.ghost;
    renderer.setRenderTarget(this._renderTargetData.ghost);
    renderer.clear();
    yield geometry;

    renderer.setRenderTarget(this._renderTargetData.finalComposition);
    yield blitToComposition;
  }

  private *renderCustom(renderer: THREE.WebGLRenderer) {
    const { geometry } = this._defaultRenderPipelinePasses.custom;
    renderer.setRenderTarget(this._renderTargetData.finalComposition);
    yield geometry;
  }

  private *renderBack(renderer: THREE.WebGLRenderer) {
    const { geometry, blitToComposition, ssao, blitSsaoBlur, edgeDetect, outline } =
      this._defaultRenderPipelinePasses.back;

    renderer.setRenderTarget(this._renderTargetData.color);
    renderer.clear();
    yield geometry;

    renderer.setRenderTarget(this._renderTargetData.backComposition);
    renderer.clear();
    yield blitToComposition;

    renderer.setRenderTarget(this._renderTargetData.ssao);
    yield ssao;

    renderer.setRenderTarget(this._renderTargetData.backComposition);
    yield blitSsaoBlur;

    if (this._renderOptions.edgeDetectionParameters.enabled) {
      yield edgeDetect;
    }
    yield outline;
  }

  private *renderInFront(renderer: THREE.WebGLRenderer) {
    const { geometry, blitToComposition, outline } = this._defaultRenderPipelinePasses.inFront;

    renderer.setRenderTarget(this._renderTargetData.inFront);
    renderer.clear();
    yield geometry;

    renderer.setRenderTarget(this._renderTargetData.opaqueComposition);
    renderer.clear();
    yield blitToComposition;

    yield outline;
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

  private initializeRenderPasses(renderOptions: RenderOptions): DefaultRenderPipelinePasses {
    const ssaoRenderParameters = renderOptions.ssaoRenderParameters ?? defaultRenderOptions.ssaoRenderParameters;

    const inFront = {
      geometry: new GeometryPass(this._cadScene, this._materialManager, RenderMode.Effects),
      blitToComposition: new BlitPass({
        texture: this._renderTargetData.inFront.texture,
        depthTexture: this._renderTargetData.inFront.depthTexture,
        overrideAlpha: 0.5
      }),
      outline: new OutlinePass(this._renderTargetData.inFront.texture)
    };

    const back = {
      geometry: new GeometryPass(this._cadScene, this._materialManager, RenderMode.Color),
      blitToComposition: new BlitPass({
        texture: this._renderTargetData.color.texture,
        depthTexture: this._renderTargetData.color.depthTexture
      }),
      ssao: new SSAOPass(this._renderTargetData.color.depthTexture, ssaoRenderParameters),
      blitSsaoBlur: new BlitPass({
        texture: this._renderTargetData.ssao.texture,
        effect: BlitEffect.GaussianBlur,
        blendOptions: alphaMaskBlendOptions
      }),
      edgeDetect: new EdgeDetectPass(this._renderTargetData.color.texture),
      outline: new OutlinePass(this._renderTargetData.color.texture)
    };

    const custom = {
      geometry: new GeometryPass(
        this._cadScene,
        this._materialManager,
        RenderMode.Color,
        getLayerMask(RenderLayer.CustomNormal)
      ),
      deferred: new GeometryPass(
        this._cadScene,
        this._materialManager,
        RenderMode.Color,
        getLayerMask(RenderLayer.CustomDeferred)
      )
    };

    const ghost = {
      geometry: new GeometryPass(this._cadScene, this._materialManager, RenderMode.Ghost),
      blitToComposition: new BlitPass({
        texture: this._renderTargetData.ghost.texture,
        depthTexture: this._renderTargetData.ghost.depthTexture,
        blendOptions: transparentBlendOptions
      })
    };

    const blitOpaque = new BlitPass({
      texture: this._renderTargetData.backComposition.texture,
      depthTexture: this._renderTargetData.backComposition.depthTexture,
      blendOptions: { blendDestination: THREE.DstAlphaFactor, blendSource: THREE.OneMinusDstAlphaFactor }
    });

    const blitComposite = new BlitPass({
      texture: this._renderTargetData.opaqueComposition.texture,
      depthTexture: this._renderTargetData.opaqueComposition.depthTexture,
      overrideAlpha: 1
    });

    const blitEffect =
      AntiAliasingMode[renderOptions.antiAliasing] === AntiAliasingMode[AntiAliasingMode.FXAA]
        ? BlitEffect.Fxaa
        : BlitEffect.None;

    const blitToOutput = new BlitPass({
      texture: this._renderTargetData.finalComposition.texture,
      effect: blitEffect
    });

    return { inFront, back, custom, ghost, blitOpaque, blitComposite, blitToOutput };
  }

  private updateRenderTargetSizes(renderer: THREE.WebGLRenderer): void {
    const renderSize = new THREE.Vector2();
    renderer.getSize(renderSize);

    const { x: width, y: height } = renderSize;

    const currentSize = this._renderTargetData.currentRenderSize;
    if (width === currentSize.x && height === currentSize.y) {
      return;
    }

    this._renderTargetData.backComposition.setSize(width, height);
    this._renderTargetData.opaqueComposition.setSize(width, height);
    this._renderTargetData.finalComposition.setSize(width, height);
    this._renderTargetData.color.setSize(width, height);
    this._renderTargetData.ghost.setSize(width, height);
    this._renderTargetData.inFront.setSize(width, height);
    this._renderTargetData.ssao.setSize(width, height);

    this._renderTargetData.currentRenderSize.set(width, height);

    if (this._outputRenderTarget.target !== null && this._outputRenderTarget.autoUpdateSize) {
      this._outputRenderTarget.target.setSize(width, height);
    }
  }
}
