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
import { createRenderTarget, RenderLayer, setupGeometryLayers } from '../utilities/renderUtilities';
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

type DefaultRenderPipelinePasses = {
  inFront: {
    geometry: RenderPass;
    blitToComposition: RenderPass;
    outline: RenderPass;
  };
  back: {
    geometry: RenderPass;
    blitToComposition: RenderPass;
    ssao: RenderPass;
    blitSsaoBlur: RenderPass;
    edgeDetect: RenderPass;
    outline: RenderPass;
  };
  ghost: {
    geometry: RenderPass;
    blitToComposition: RenderPass;
  };
  custom: {
    geometry: RenderPass;
    deferred: RenderPass;
  };
  blitComposite: RenderPass;
  blitToOutput: RenderPass;
};

export class DefaultRenderPipeline implements RenderPipelineProvider {
  private readonly _materialManager: CadMaterialManager;
  private readonly _cadScene: THREE.Scene;
  private readonly _renderTargetData: RenderTargetData;
  private readonly _cadModels: THREE.Group;
  private readonly _customObjects: THREE.Group;
  private readonly _ssaoPass: SSAOPass;
  private readonly _defaultRenderPipelinePasses: DefaultRenderPipelinePasses;

  constructor(
    materialManager: CadMaterialManager,
    scene: THREE.Scene,
    cadModels?: THREE.Group,
    customObjects?: THREE.Group
  ) {
    this._materialManager = materialManager;
    this._cadScene = scene;
    this._renderTargetData = {
      currentRenderSize: new THREE.Vector2(1, 1),
      opaqueComposition: createRenderTarget(),
      finalComposition: createRenderTarget(),
      color: createRenderTarget(1, 1, 8),
      ghost: createRenderTarget(1, 1, 8),
      inFront: createRenderTarget(1, 1, 8),
      ssao: new THREE.WebGLRenderTarget(1, 1)
    };
    this._cadModels = cadModels;
    this._customObjects = customObjects;

    this._defaultRenderPipelinePasses = this.initializeRenderPasses();

    this._ssaoPass = new SSAOPass(this._renderTargetData.color.depthTexture);
  }

  private initializeRenderPasses(): DefaultRenderPipelinePasses {
    return {
      inFront: {
        geometry: new GeometryPass(this._cadScene, this._materialManager, RenderMode.Effects),
        blitToComposition: new BlitPass({
          texture: this._renderTargetData.inFront.texture,
          depthTexture: this._renderTargetData.inFront.depthTexture,
          overrideAlpha: 0.5
        }),
        outline: new OutlinePass(this._renderTargetData.inFront.texture)
      },
      back: {
        geometry: new GeometryPass(this._cadScene, this._materialManager, RenderMode.Color),
        blitToComposition: new BlitPass({
          texture: this._renderTargetData.color.texture,
          depthTexture: this._renderTargetData.color.depthTexture
        }),
        ssao: new SSAOPass(this._renderTargetData.color.depthTexture),
        blitSsaoBlur: new BlitPass({
          texture: this._renderTargetData.ssao.texture,
          effect: BlitEffect.GaussianBlur,
          blendOptions: alphaMaskBlendOptions
        }),
        edgeDetect: new EdgeDetectPass(this._renderTargetData.color.texture),
        outline: new OutlinePass(this._renderTargetData.color.texture)
      },
      custom: {
        geometry: new GeometryPass(this._cadScene, this._materialManager, RenderMode.Color, RenderLayer.CustomNormal),
        deferred: new GeometryPass(this._cadScene, this._materialManager, RenderMode.Color, RenderLayer.CustomDeferred)
      },
      ghost: {
        geometry: new GeometryPass(this._cadScene, this._materialManager, RenderMode.Ghost),
        blitToComposition: new BlitPass({
          texture: this._renderTargetData.ghost.texture,
          depthTexture: this._renderTargetData.ghost.depthTexture,
          blendOptions: transparentBlendOptions
        })
      },
      blitComposite: new BlitPass({
        texture: this._renderTargetData.opaqueComposition.texture,
        depthTexture: this._renderTargetData.opaqueComposition.depthTexture,
        blendOptions: { blendDestination: THREE.DstAlphaFactor, blendSource: THREE.OneMinusDstAlphaFactor }
      }),
      blitToOutput: new BlitPass({ texture: this._renderTargetData.finalComposition.texture, effect: BlitEffect.Fxaa })
    };
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
    const blitToOutput = this._defaultRenderPipelinePasses.blitToOutput;
    renderer.setRenderTarget(null);
    yield blitToOutput;
  }

  private *renderCompositeGeometry(renderer: THREE.WebGLRenderer) {
    const blitComposite = this._defaultRenderPipelinePasses.blitComposite;
    yield* this.renderBack(renderer);

    yield* this.renderCustom(renderer);

    yield* this.renderGhosted(renderer);

    renderer.setRenderTarget(this._renderTargetData.finalComposition);
    yield blitComposite;
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

    renderer.setRenderTarget(this._renderTargetData.opaqueComposition);
    yield blitToComposition;
  }

  private *renderCustom(renderer: THREE.WebGLRenderer) {
    const { geometry } = this._defaultRenderPipelinePasses.custom;
    renderer.setRenderTarget(this._renderTargetData.opaqueComposition);
    yield geometry;
  }

  private *renderBack(renderer: THREE.WebGLRenderer) {
    const { geometry, blitToComposition, ssao, blitSsaoBlur, edgeDetect, outline } =
      this._defaultRenderPipelinePasses.back;

    renderer.setRenderTarget(this._renderTargetData.color);
    renderer.clear();
    yield geometry;

    renderer.setRenderTarget(this._renderTargetData.opaqueComposition);
    renderer.clear();
    yield blitToComposition;

    renderer.setRenderTarget(this._renderTargetData.ssao);
    yield ssao;

    renderer.setRenderTarget(this._renderTargetData.opaqueComposition);
    yield blitSsaoBlur;

    yield edgeDetect;
    yield outline;
  }

  private *renderInFront(renderer: THREE.WebGLRenderer) {
    const { geometry, blitToComposition, outline } = this._defaultRenderPipelinePasses.inFront;

    renderer.setRenderTarget(this._renderTargetData.inFront);
    renderer.clear();
    yield geometry;

    renderer.setRenderTarget(this._renderTargetData.finalComposition);
    renderer.clear();
    yield blitToComposition;

    yield outline;
  }

  private pipelineTearDown(renderer: THREE.WebGLRenderer) {
    renderer.autoClear = true;
  }

  private pipelineSetup(renderer: THREE.WebGLRenderer) {
    renderer.sortObjects = false;
    renderer.autoClear = false;
    renderer.setClearAlpha(0.0);
    this._cadModels.matrixAutoUpdate = false;
    this._cadScene.autoUpdate = false;

    this._customObjects.updateMatrixWorld(true);

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
