/*!
 * Copyright 2022 Cognite AS
 */

import * as THREE from 'three';
import { CadMaterialManager } from '../CadMaterialManager';
import { BlitPass, transparentBlendOptions, BlitEffect, alphaMaskBlendOptions } from '../render-passes/BlitPass';
import { GeometryPass } from '../render-passes/GeometryPass';
import { EdgeDetectPass } from '../render-passes/EdgeDetectPass';
import { SSAOPass } from '../render-passes/SSAOPass';
import { RenderMode } from '../rendering/RenderMode';
import { RenderPass } from '../RenderPass';
import { RenderPipelineProvider } from '../RenderPipelineProvider';
import { createRenderTargetWithDepth, RenderLayer, setupGeometryLayers } from '../utilities/renderUtilities';
import { OutlinePass } from '../render-passes/OutlinePass';

type RenderTargetData = {
  currentRenderSize: THREE.Vector2;
  opaqueComposition: THREE.WebGLRenderTarget;
  finalComposition: THREE.WebGLRenderTarget;
  color: THREE.WebGLRenderTarget;
  ghost: THREE.WebGLRenderTarget;
  inFront: THREE.WebGLRenderTarget;
  ssao: THREE.WebGLRenderTarget;
};

export class DefaultRenderPipeline implements RenderPipelineProvider {
  private readonly _materialManager: CadMaterialManager;
  private readonly _cadScene: THREE.Object3D;
  private readonly _renderTargetData: RenderTargetData;
  private readonly _cadModels: THREE.Group;
  private readonly _customObjects: THREE.Group;
  private readonly _ssaoPass: SSAOPass;

  constructor(
    materialManager: CadMaterialManager,
    scene: THREE.Object3D,
    cadModels?: THREE.Group,
    customObjects?: THREE.Group
  ) {
    this._materialManager = materialManager;
    this._cadScene = scene;
    this._renderTargetData = {
      currentRenderSize: new THREE.Vector2(1, 1),
      opaqueComposition: createRenderTargetWithDepth(),
      finalComposition: createRenderTargetWithDepth(),
      color: createRenderTargetWithDepth(),
      ghost: createRenderTargetWithDepth(),
      inFront: createRenderTargetWithDepth(),
      ssao: new THREE.WebGLRenderTarget(1, 1)
    };
    this._cadModels = cadModels;
    this._customObjects = customObjects;

    this._ssaoPass = new SSAOPass(this._renderTargetData.color.depthTexture);
  }

  public *pipeline(renderer: THREE.WebGLRenderer): Generator<RenderPass> {
    this.pipelineSetup(renderer);

    setupGeometryLayers(this._cadModels, this._customObjects, this._materialManager);

    yield* this.renderInFront(renderer);

    yield* this.renderCompositeGeometry(renderer);

    yield* this.renderDeferredCustom(renderer);

    yield* this.blitToCanvas(renderer);

    this.pipelineTearDown(renderer);
    return;
  }

  private *blitToCanvas(renderer: THREE.WebGLRenderer) {
    renderer.setRenderTarget(null);
    yield new BlitPass({ texture: this._renderTargetData.finalComposition.texture, effect: BlitEffect.Fxaa });
  }

  private *renderCompositeGeometry(renderer: THREE.WebGLRenderer) {
    yield* this.renderBack(renderer);

    yield* this.renderCustom(renderer);

    yield* this.renderGhosted(renderer);

    renderer.setRenderTarget(this._renderTargetData.finalComposition);
    yield new BlitPass({
      texture: this._renderTargetData.opaqueComposition.texture,
      depthTexture: this._renderTargetData.opaqueComposition.depthTexture,
      blendOptions: { blendDestination: THREE.DstAlphaFactor, blendSource: THREE.OneMinusDstAlphaFactor }
    });
  }

  private *renderDeferredCustom(renderer: THREE.WebGLRenderer) {
    renderer.setRenderTarget(this._renderTargetData.finalComposition);
    yield new GeometryPass(this._cadScene, this._materialManager, RenderMode.Color, RenderLayer.CustomDeferred);
  }

  private *renderGhosted(renderer: THREE.WebGLRenderer) {
    renderer.setRenderTarget(this._renderTargetData.ghost);
    renderer.clear();
    yield new GeometryPass(this._cadScene, this._materialManager, RenderMode.Ghost);

    renderer.setRenderTarget(this._renderTargetData.opaqueComposition);
    yield new BlitPass({
      texture: this._renderTargetData.ghost.texture,
      depthTexture: this._renderTargetData.ghost.depthTexture,
      blendOptions: transparentBlendOptions
    });
  }

  private *renderCustom(renderer: THREE.WebGLRenderer) {
    renderer.setRenderTarget(this._renderTargetData.opaqueComposition);
    yield new GeometryPass(this._cadScene, this._materialManager, RenderMode.Color, RenderLayer.CustomNormal);
  }

  private *renderBack(renderer: THREE.WebGLRenderer) {
    renderer.setRenderTarget(this._renderTargetData.color);
    renderer.clear();
    yield new GeometryPass(this._cadScene, this._materialManager, RenderMode.Color);

    renderer.setRenderTarget(this._renderTargetData.opaqueComposition);
    renderer.clear();
    yield new BlitPass({
      texture: this._renderTargetData.color.texture,
      depthTexture: this._renderTargetData.color.depthTexture
    });

    renderer.setRenderTarget(this._renderTargetData.ssao);
    yield this._ssaoPass;

    renderer.setRenderTarget(this._renderTargetData.opaqueComposition);
    yield new BlitPass({
      texture: this._renderTargetData.ssao.texture,
      effect: BlitEffect.GaussianBlur,
      blendOptions: alphaMaskBlendOptions
    });

    yield new EdgeDetectPass(this._renderTargetData.color.texture);
    yield new OutlinePass(this._renderTargetData.color.texture);
  }

  private *renderInFront(renderer: THREE.WebGLRenderer) {
    renderer.setRenderTarget(this._renderTargetData.inFront);
    renderer.clear();
    yield new GeometryPass(this._cadScene, this._materialManager, RenderMode.Effects);

    renderer.setRenderTarget(this._renderTargetData.finalComposition);
    renderer.clear();
    yield new BlitPass({
      texture: this._renderTargetData.inFront.texture,
      depthTexture: this._renderTargetData.inFront.depthTexture,
      overrideAlpha: 0.5
    });

    yield new OutlinePass(this._renderTargetData.inFront.texture);
  }

  private pipelineTearDown(renderer: THREE.WebGLRenderer) {
    renderer.autoClear = true;
  }

  private pipelineSetup(renderer: THREE.WebGLRenderer) {
    renderer.autoClear = false;
    renderer.setClearAlpha(0.0);

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

    this._renderTargetData.opaqueComposition.setSize(width, height);
    this._renderTargetData.finalComposition.setSize(width, height);
    this._renderTargetData.color.setSize(width, height);
    this._renderTargetData.ghost.setSize(width, height);
    this._renderTargetData.inFront.setSize(width, height);
    this._renderTargetData.ssao.setSize(width, height);
  }
}
