/*!
 * Copyright 2022 Cognite AS
 */

import * as THREE from 'three';
import { CadMaterialManager } from '../CadMaterialManager';
import { BlitPass } from '../render-passes/BlitPass';
import { GeometryPass } from '../render-passes/GeometryPass';
import { RenderMode } from '../rendering/RenderMode';
import { RenderPass } from '../RenderPass';
import { RenderPipelineProvider } from '../RenderPipelineProvider';
import { createRenderTargetWithDepth, RenderLayer, setupGeometryLayers } from '../utilities/renderUtilities';

type RenderTargetData = {
  currentRenderSize: THREE.Vector2;
  composition: THREE.WebGLRenderTarget;
  ghost: THREE.WebGLRenderTarget;
  inFront: THREE.WebGLRenderTarget;
};

export class DefaultRenderPipeline implements RenderPipelineProvider {
  private readonly _materialManager: CadMaterialManager;
  private readonly _cadScene: THREE.Object3D;
  private readonly _renderTargetData: RenderTargetData;
  private readonly _cadModels: THREE.Group;
  private readonly _customObjects: THREE.Group;

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
      ghost: createRenderTargetWithDepth(),
      inFront: new THREE.WebGLRenderTarget(1, 1)
    };
    this._cadModels = cadModels;
    this._customObjects = customObjects;
  }

  public *pipeline(renderer: THREE.WebGLRenderer): Generator<RenderPass> {
    this.pipelineSetup(renderer);
    setupGeometryLayers(this._cadModels, this._customObjects, this._materialManager);

    yield* this.geometryPass(renderer, RenderMode.Color, this._renderTargetData.composition);

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
      true
    );

    yield* this.geometryPass(renderer, RenderMode.Effects, this._renderTargetData.inFront);
    yield* this.blitPass(
      renderer,
      this._renderTargetData.composition,
      this._renderTargetData.inFront.texture,
      undefined,
      true
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
    diffuseTtexture: THREE.Texture,
    depthTexture?: THREE.Texture,
    transparent = false
  ) {
    renderer.setRenderTarget(target);
    yield new BlitPass(diffuseTtexture, depthTexture, transparent);
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
    this._renderTargetData.ghost.setSize(width, height);
    this._renderTargetData.inFront.setSize(width, height);
  }
}
