/*!
 * Copyright 2022 Cognite AS
 */

import type { WebGLRenderer } from 'three';
import {
  CustomBlending,
  DepthTexture,
  FloatType,
  NearestFilter,
  NoBlending,
  OneFactor,
  RGBAFormat,
  SrcAlphaFactor,
  UnsignedIntType,
  Vector2,
  WebGLRenderTarget
} from 'three';
import type { RenderPass } from '../RenderPass';
import type { RenderPipelineProvider } from '../RenderPipelineProvider';
import type { SceneHandler } from '@reveal/utilities';
import { PointCloudEffectsPass } from '../render-passes/PointCloudEffectsPass';
import type { PointCloudRenderTargets } from './types';
import type { PointCloudPassParameters } from '../render-passes/types';
import type { PointCloudParameters } from '../rendering/types';
import { PointShape } from '../pointcloud-rendering';
import type { PointCloudMaterialManager } from '../PointCloudMaterialManager';
import { shouldApplyEdl } from './pointCloudParameterUtils';

export class PointCloudRenderPipelineProvider implements RenderPipelineProvider {
  private readonly _renderTargetData: {
    currentRenderSize: Vector2;
    logDepthAndDepthOutput: WebGLRenderTarget;
    output: WebGLRenderTarget;
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
      blending: NoBlending,
      colorWrite: true
    }
  };
  private static readonly AttributePassParameters: PointCloudPassParameters = {
    material: {
      weighted: true,
      shape: PointShape.Circle,
      hqDepthPass: false,
      depthWrite: false,
      blending: CustomBlending,
      blendSrc: SrcAlphaFactor,
      blendDst: OneFactor,
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
    const depthTexture = new DepthTexture(1, 1, UnsignedIntType);
    this._renderTargetData = {
      currentRenderSize: new Vector2(1, 1),
      logDepthAndDepthOutput: new WebGLRenderTarget(1, 1, {
        minFilter: NearestFilter,
        magFilter: NearestFilter,
        format: RGBAFormat,
        type: FloatType,
        depthTexture: depthTexture
      }),
      output: new WebGLRenderTarget(1, 1, {
        minFilter: NearestFilter,
        magFilter: NearestFilter,
        format: RGBAFormat,
        type: FloatType,
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

  public *pipeline(renderer: WebGLRenderer): Generator<RenderPass> {
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

  private updateRenderTargetSizes(renderer: WebGLRenderer): void {
    const renderSize = new Vector2();
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
