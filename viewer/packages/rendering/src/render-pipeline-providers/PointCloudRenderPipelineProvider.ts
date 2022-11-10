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
import { PointShape } from '../pointcloud-rendering';
import { PointCloudMaterialManager } from '../PointCloudMaterialManager';
import { shouldApplyEdl } from './pointCloudParameterUtils';

export class PointCloudRenderPipelineProvider implements RenderPipelineProvider {
  private readonly _renderTargetData: {
    currentRenderSize: THREE.Vector2;
    logDepthAndDepthOutput: THREE.WebGLRenderTarget;
    output: THREE.WebGLRenderTarget;
  };
  private readonly _renderParameters: PointCloudParameters;
  private readonly _depthPass: PointCloudEffectsPass;
  private readonly _attributePass: PointCloudEffectsPass;
  private readonly _standardPass: PointCloudEffectsPass;
  private readonly _sceneHandler: SceneHandler;

  private static readonly DepthPassParameters: PointCloudPassParameters = {
    material: {
      weighted: false,
      shape: PointShape.Circle,
      hqDepthPass: true,
      depthWrite: true,
      blending: THREE.NoBlending,
      colorWrite: true
    }
  };
  private static readonly AttributePassParameters: PointCloudPassParameters = {
    material: {
      weighted: true,
      shape: PointShape.Circle,
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

  constructor(
    sceneHandler: SceneHandler,
    pointCloudMaterialManager: PointCloudMaterialManager,
    renderParameters: PointCloudParameters
  ) {
    const depthTexture = new THREE.DepthTexture(1, 1, THREE.UnsignedIntType);
    this._renderTargetData = {
      currentRenderSize: new THREE.Vector2(1, 1),
      logDepthAndDepthOutput: new THREE.WebGLRenderTarget(1, 1, {
        minFilter: THREE.NearestFilter,
        magFilter: THREE.NearestFilter,
        format: THREE.RGBAFormat,
        type: THREE.FloatType,
        depthTexture: depthTexture
      }),
      output: new THREE.WebGLRenderTarget(1, 1, {
        minFilter: THREE.NearestFilter,
        magFilter: THREE.NearestFilter,
        format: THREE.RGBAFormat,
        type: THREE.FloatType,
        depthTexture: depthTexture
      })
    };

    this._sceneHandler = sceneHandler;
    this._renderParameters = renderParameters;

    const standardPassParameters: PointCloudPassParameters = {
      material: {
        useEDL: shouldApplyEdl(renderParameters.edlOptions)
      }
    };

    PointCloudRenderPipelineProvider.DepthPassParameters.material!.useEDL = shouldApplyEdl(renderParameters.edlOptions);

    this._standardPass = new PointCloudEffectsPass(
      sceneHandler.scene,
      pointCloudMaterialManager,
      standardPassParameters
    );
    this._depthPass = new PointCloudEffectsPass(
      sceneHandler.scene,
      pointCloudMaterialManager,
      PointCloudRenderPipelineProvider.DepthPassParameters
    );
    this._attributePass = new PointCloudEffectsPass(
      sceneHandler.scene,
      pointCloudMaterialManager,
      PointCloudRenderPipelineProvider.AttributePassParameters
    );
  }

  get pointCloudRenderTargets(): PointCloudRenderTargets {
    return {
      pointCloudLogDepth: this._renderTargetData.logDepthAndDepthOutput,
      pointCloud: this._renderTargetData.output
    };
  }

  public *pipeline(renderer: THREE.WebGLRenderer): Generator<RenderPass> {
    this.updateRenderTargetSizes(renderer);

    // Needs to be updated manually since automatic update is disabled because of CAD pipeline.
    this._sceneHandler.pointCloudModels.forEach(model => model.pointCloudNode.updateMatrixWorld(true));

    try {

      if (this._renderParameters.pointBlending) {
        renderer.setRenderTarget(this._renderTargetData.logDepthAndDepthOutput);
        yield this._depthPass;

        renderer.setRenderTarget(this._renderTargetData.output);
        renderer.setClearColor('#000000', 0.0);
        renderer.clearColor();
        yield this._attributePass;
      } else {
        renderer.setRenderTarget(this._renderTargetData.output);
        yield this._standardPass;
      }
    } finally {
      renderer.setClearColor('#FFFFFF', 0.0);
    }
  }

  public dispose(): void {
    this._renderTargetData.logDepthAndDepthOutput.dispose();
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
    this._renderTargetData.logDepthAndDepthOutput.setSize(width, height);
    this._renderTargetData.output.setSize(width, height);
  }
}
