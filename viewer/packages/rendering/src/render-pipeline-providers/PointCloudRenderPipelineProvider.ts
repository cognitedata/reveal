/*!
 * Copyright 2022 Cognite AS
 */

import * as THREE from 'three';
import { RenderPass } from '../RenderPass';
import { RenderPipelineProvider } from '../RenderPipelineProvider';
import { SceneHandler } from '@reveal/utilities';
import { PointCloudEffectsPass } from '../render-passes/PointCloudEffectsPass';
import { CognitePointCloudModel } from '@reveal/pointclouds';
import { PointCloudRenderTargets } from './types';
import { PointCloudPassParameters } from '../render-passes/types';

export class PointCloudRenderPipelineProvider implements RenderPipelineProvider {
  private readonly _renderTargetData: {
    currentRenderSize: THREE.Vector2;
    depth: THREE.WebGLRenderTarget;
    attribute: THREE.WebGLRenderTarget;
  };
  private readonly _pointCloudModels: {
    object: CognitePointCloudModel;
    modelIdentifier: symbol;
  }[];
  private readonly _depthPass: PointCloudEffectsPass;
  private readonly _attributePass: PointCloudEffectsPass;

  private DepthPassParameters: PointCloudPassParameters = {
    material: {
        weighted: false,
        hqDepthPass: true,
        depthWrite: true,
        blending: THREE.NormalBlending,
        colorWrite: false
    }
  }
  private AttributePassParameters: PointCloudPassParameters = {
    material: {
        weighted: true,
        hqDepthPass: false,
        depthWrite: false,
        blending: THREE.CustomBlending,
        blendSrc: THREE.SrcAlphaFactor,
        blendDst: THREE.OneFactor,
        colorWrite: true
    },
    renderer: {
        autoClearDepth: false
    }
  }

  public readonly scene: THREE.Scene;

  constructor(sceneHandler: SceneHandler) {
    this.scene = sceneHandler.scene;
    this._pointCloudModels = sceneHandler.pointCloudModels;
    this._renderTargetData = {
      currentRenderSize: new THREE.Vector2(1000, 1000),
      depth: new THREE.WebGLRenderTarget(1000, 1000, {
        minFilter: THREE.NearestFilter,
        magFilter: THREE.NearestFilter,
        format: THREE.RGBAFormat,
        type: THREE.FloatType,
        depthBuffer: true,
        depthTexture: new THREE.DepthTexture(1000, 1000, THREE.UnsignedIntType)}),
      attribute: new THREE.WebGLRenderTarget(1, 1)
    };


    this._renderTargetData.attribute = new THREE.WebGLRenderTarget(1000, 1000, {
        minFilter: THREE.NearestFilter,
        magFilter: THREE.NearestFilter,
        format: THREE.RGBAFormat,
        type: THREE.FloatType, 
        depthTexture: this._renderTargetData.depth.depthTexture
    });

    this._renderTargetData.attribute.depthTexture.format = THREE.DepthFormat;
    this._renderTargetData.attribute.depthTexture.type = THREE.UnsignedIntType;

    this._depthPass = new PointCloudEffectsPass(sceneHandler, this.DepthPassParameters);
    this._attributePass = new PointCloudEffectsPass(sceneHandler, this.AttributePassParameters);
  }

  get pointCloudRenderTargets(): PointCloudRenderTargets {
    return { 
        pointCloud: this._renderTargetData.attribute,
        pointCloudDepth: this._renderTargetData.depth
    }
  }

  public *pipeline(renderer: THREE.WebGLRenderer): Generator<RenderPass> {
      this.updateRenderTargetSizes(renderer);

      try {
          renderer.setRenderTarget(this._renderTargetData.depth);
          yield this._depthPass;

          
          renderer.setRenderTarget(this._renderTargetData.attribute);
          renderer.setClearColor('#000000', 0.0);
          renderer.clearColor();
          yield this._attributePass;
      } finally {
         renderer.setClearColor('#FFFFFF', 0.0);
      }
  }

  public dispose(): void {
    this._renderTargetData.depth.dispose();
    this._renderTargetData.attribute.dispose();
  }

  private updateRenderTargetSizes(renderer: THREE.WebGLRenderer): void {
    const renderSize = new THREE.Vector2();
    renderer.getDrawingBufferSize(renderSize);

    const { x: width, y: height } = renderSize;

    const currentSize = this._renderTargetData.currentRenderSize;
    if (width === currentSize.x && height === currentSize.y) {
      return;
    }

    this._renderTargetData.currentRenderSize.set(width, height);
    this._renderTargetData.attribute.setSize(width, height);
    this._renderTargetData.depth.setSize(width, height);
  }
}
