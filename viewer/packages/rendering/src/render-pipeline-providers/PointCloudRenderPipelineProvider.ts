/*!
 * Copyright 2022 Cognite AS
 */

import * as THREE from 'three';
import { RenderPass } from '../RenderPass';
import { RenderPipelineProvider } from '../RenderPipelineProvider';
import { SceneHandler } from '@reveal/utilities';
import { PointCloudEffectsPass } from '../render-passes/PointCloudEffectsPass';
import { PointCloudRenderTargets } from './types';
import { PointCloudPassParameters } from '../render-passes/types';
import { PointCloudParameters } from '../rendering/types';

export class PointCloudRenderPipelineProvider implements RenderPipelineProvider {
  private readonly _renderTargetData: {
    currentRenderSize: THREE.Vector2;
    output: THREE.WebGLRenderTarget;
  };
  private readonly _renderParameters: PointCloudParameters;
  private readonly _depthPass: PointCloudEffectsPass;
  private readonly _attributePass: PointCloudEffectsPass;
  private readonly _standardPass: PointCloudEffectsPass;

  private readonly DepthPassParameters: PointCloudPassParameters = {
    material: {
      weighted: false,
      hqDepthPass: true,
      depthWrite: true,
      blending: THREE.NormalBlending,
      colorWrite: false
    }
  };
  private readonly AttributePassParameters: PointCloudPassParameters = {
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
  };

  constructor(sceneHandler: SceneHandler, renderParameters: PointCloudParameters) {
    this._renderTargetData = {
      currentRenderSize: new THREE.Vector2(1, 1),
      output: new THREE.WebGLRenderTarget(1, 1, {
        minFilter: THREE.NearestFilter,
        magFilter: THREE.NearestFilter,
        format: THREE.RGBAFormat,
        type: THREE.FloatType,
        depthTexture: new THREE.DepthTexture(1, 1, THREE.UnsignedIntType)
      })
    };

    this._renderParameters = renderParameters;

    this._standardPass = new PointCloudEffectsPass(sceneHandler);
    this._depthPass = new PointCloudEffectsPass(sceneHandler, this.DepthPassParameters);
    this._attributePass = new PointCloudEffectsPass(sceneHandler, this.AttributePassParameters);
  }

  get pointCloudRenderTargets(): PointCloudRenderTargets {
    return {
      pointCloud: this._renderTargetData.output
    };
  }

  public *pipeline(renderer: THREE.WebGLRenderer): Generator<RenderPass> {
    this.updateRenderTargetSizes(renderer);

    try {
      renderer.setRenderTarget(this._renderTargetData.output);

      if (this._renderParameters.pointBlending) {
        yield this._depthPass;

        renderer.setClearColor('#000000', 0.0);
        renderer.clearColor();
        yield this._attributePass;
      } else {
        yield this._standardPass;
      }
    } finally {
      renderer.setClearColor('#FFFFFF', 0.0);
    }
  }

  public dispose(): void {
    this._renderTargetData.output.dispose();
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
    this._renderTargetData.output.setSize(width, height);
  }
}
