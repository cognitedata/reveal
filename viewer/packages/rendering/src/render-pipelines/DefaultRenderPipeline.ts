/*!
 * Copyright 2022 Cognite AS
 */

import * as THREE from 'three';
import { CadMaterialManager } from '../CadMaterialManager';
import { alphaMaskBlendOptions, BlitOptions, BlitPass, transparentBlendOptions } from '../render-passes/BlitPass';
import { EdgeDetectPass } from '../render-passes/EdgeDetectPass';
import { GeometryPass } from '../render-passes/GeometryPass';
import { SSAOPass } from '../render-passes/SSAOPass';
import { RenderMode } from '../rendering/RenderMode';
import { RenderPass } from '../RenderPass';
import { RenderPipelineProvider } from '../RenderPipelineProvider';
import { createRenderTargetWithDepth, RenderLayer, setupGeometryLayers } from '../utilities/renderUtilities';

type RenderTargetData = {
  currentRenderSize: THREE.Vector2;
  composition: THREE.WebGLRenderTarget;
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
      composition: createRenderTargetWithDepth(),
      color: createRenderTargetWithDepth(),
      ghost: createRenderTargetWithDepth(),
      inFront: new THREE.WebGLRenderTarget(1, 1),
      ssao: new THREE.WebGLRenderTarget(1, 1)
    };
    this._cadModels = cadModels;
    this._customObjects = customObjects;

    this._ssaoPass = new SSAOPass(this._renderTargetData.color.depthTexture);
  }

  public *pipeline(renderer: THREE.WebGLRenderer): Generator<RenderPass> {
    this.pipelineSetup(renderer);
    setupGeometryLayers(this._cadModels, this._customObjects, this._materialManager);

    yield* this.geometryPass(renderer, RenderMode.Color, this._renderTargetData.color);

    yield* this.blitPass(
      renderer,
      this._renderTargetData.composition,
      this._renderTargetData.color.texture,
      this._renderTargetData.color.depthTexture,
      false
    );

    renderer.setRenderTarget(this._renderTargetData.ssao);
    yield this._ssaoPass;

    renderer.setRenderTarget(this._renderTargetData.composition);
    const texture = this._renderTargetData.ssao.texture;
    yield new BlitPass({ texture, blendOptions: alphaMaskBlendOptions });

    renderer.setRenderTarget(this._renderTargetData.composition);
    yield new EdgeDetectPass(this._renderTargetData.color.texture);

    yield* this.geometryPass(
      renderer,
      RenderMode.Color,
      this._renderTargetData.composition,
      RenderLayer.CustomNormal,
      false
    );

    yield* this.geometryPass(renderer, RenderMode.Ghost, this._renderTargetData.ghost);
    yield* this.blitPass(
      renderer,
      this._renderTargetData.composition,
      this._renderTargetData.ghost.texture,
      this._renderTargetData.ghost.depthTexture,
      true,
      false
    );

    yield* this.geometryPass(renderer, RenderMode.Effects, this._renderTargetData.inFront);
    yield* this.blitPass(
      renderer,
      this._renderTargetData.composition,
      this._renderTargetData.inFront.texture,
      undefined,
      true,
      false
    );

    yield* this.geometryPass(
      renderer,
      RenderMode.Color,
      this._renderTargetData.composition,
      RenderLayer.CustomDeferred,
      false
    );

    yield* this.blitPass(renderer, null, this._renderTargetData.composition.texture);

    this.pipelineTearDown(renderer);
  }

  private *blitPass(
    renderer: THREE.WebGLRenderer,
    target: THREE.WebGLRenderTarget,
    texture: THREE.Texture,
    depthTexture?: THREE.DepthTexture,
    transparent = false,
    clear = true
  ) {
    renderer.setRenderTarget(target);
    if (clear) {
      renderer.clear();
    }

    const blitOptions: BlitOptions = {
      texture
    };

    if (depthTexture !== undefined) {
      blitOptions.depthTexture = depthTexture;
    }

    if (transparent) {
      blitOptions.blendOptions = transparentBlendOptions;
    }

    yield new BlitPass(blitOptions);
  }

  private *geometryPass(
    renderer: THREE.WebGLRenderer,
    renderMode: RenderMode,
    target: THREE.WebGLRenderTarget,
    overrideRenderLayer?: RenderLayer,
    clear = true
  ): Generator<GeometryPass> {
    renderer.setRenderTarget(target);
    if (clear) {
      renderer.clear();
    }
    yield new GeometryPass(this._cadScene, this._materialManager, renderMode, overrideRenderLayer);
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

    this._renderTargetData.composition.setSize(width, height);
    this._renderTargetData.color.setSize(width, height);
    this._renderTargetData.ghost.setSize(width, height);
    this._renderTargetData.inFront.setSize(width, height);
    this._renderTargetData.ssao.setSize(width, height);
  }
}
