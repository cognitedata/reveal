/*!
 * Copyright 2022 Cognite AS
 */

import * as THREE from 'three';
import cloneDeep from 'lodash/cloneDeep';
import { CadMaterialManager } from '../CadMaterialManager';
import { RenderPass } from '../RenderPass';
import { RenderPipelineProvider } from '../RenderPipelineProvider';
import { createFullScreenTriangleMesh, createRenderTarget, hasStyledNodes } from '../utilities/renderUtilities';
import { RenderTargetData } from './types';
import { AntiAliasingMode, defaultRenderOptions, RenderOptions } from '../rendering/types';
import { CadGeometryRenderPipelineProvider } from './CadGeometryRenderPipelineProvider';
import { PostProcessingPass } from '../render-passes/PostProcessingPass';
import { SSAOPass } from '../render-passes/SSAOPass';
import { blitShaders } from '../rendering/shaders';
import { SceneHandler, WebGLRendererStateHelper, ICustomObject } from '@reveal/utilities';
import { PointCloudRenderPipelineProvider } from './PointCloudRenderPipelineProvider';
import { PointCloudMaterialManager } from '../PointCloudMaterialManager';
import { SettableRenderTarget } from '../rendering/SettableRenderTarget';

export class DefaultRenderPipelineProvider implements RenderPipelineProvider, SettableRenderTarget {
  private readonly _viewerScene: THREE.Scene;
  private readonly _renderTargetData: RenderTargetData;
  private readonly _cadModels: {
    cadNode: THREE.Object3D;
    modelIdentifier: symbol;
  }[];
  private readonly _pointCloudModels: {
    pointCloudNode: THREE.Object3D;
    modelIdentifier: symbol;
  }[];
  private readonly _customObjects: ICustomObject[];
  private _autoResizeOutputTarget: boolean;
  private _outputRenderTarget: THREE.WebGLRenderTarget | null;
  private readonly _cadGeometryRenderPipeline: CadGeometryRenderPipelineProvider;
  private readonly _pointCloudRenderPipeline: PointCloudRenderPipelineProvider;
  private readonly _postProcessingPass: PostProcessingPass;
  private readonly _ssaoPass: SSAOPass;
  private readonly _blitToScreenMaterial: THREE.RawShaderMaterial;
  private readonly _blitToScreenMesh: THREE.Mesh;
  private readonly _materialManager: CadMaterialManager;
  private _rendererStateHelper: WebGLRendererStateHelper | undefined;

  set renderOptions(renderOptions: RenderOptions) {
    const { ssaoRenderParameters } = renderOptions;
    this._ssaoPass.ssaoParameters = ssaoRenderParameters ?? defaultRenderOptions.ssaoRenderParameters;

    const shouldAddFxaa =
      AntiAliasingMode[renderOptions.antiAliasing ?? AntiAliasingMode.NoAA] === AntiAliasingMode[AntiAliasingMode.FXAA];
    const hasFxaa = this._blitToScreenMaterial.defines.FXAA ?? false;

    if (shouldAddFxaa === hasFxaa) {
      return;
    }

    if (shouldAddFxaa) {
      this._blitToScreenMaterial.defines.FXAA = true;
    } else {
      delete this._blitToScreenMaterial.defines.FXAA;
    }

    this._blitToScreenMaterial.needsUpdate = true;
  }

  constructor(
    materialManager: CadMaterialManager,
    pointCloudMaterialManager: PointCloudMaterialManager,
    sceneHandler: SceneHandler,
    renderOptions: RenderOptions,
    outputRenderTarget?: {
      target: THREE.WebGLRenderTarget;
      autoSize?: boolean;
    }
  ) {
    this._materialManager = materialManager;
    this._viewerScene = sceneHandler.scene;
    this._autoResizeOutputTarget = outputRenderTarget?.autoSize ?? true;
    this._outputRenderTarget = outputRenderTarget?.target ?? null;

    this._renderTargetData = {
      currentRenderSize: new THREE.Vector2(1, 1),
      ssaoRenderTarget: createRenderTarget(),
      postProcessingRenderTarget: createRenderTarget()
    };
    this._cadModels = sceneHandler.cadModels;
    this._pointCloudModels = sceneHandler.pointCloudModels;
    this._customObjects = sceneHandler.customObjects;

    const ssaoParameters = renderOptions.ssaoRenderParameters ?? defaultRenderOptions.ssaoRenderParameters;
    const edges = renderOptions.edgeDetectionParameters ?? defaultRenderOptions.edgeDetectionParameters;
    const pointCloudParameters = renderOptions.pointCloudParameters ?? defaultRenderOptions.pointCloudParameters;

    this._cadGeometryRenderPipeline = new CadGeometryRenderPipelineProvider(
      sceneHandler,
      materialManager,
      renderOptions
    );
    this._ssaoPass = new SSAOPass(
      this._cadGeometryRenderPipeline.cadGeometryRenderTargets.back.depthTexture,
      ssaoParameters
    );

    this._pointCloudRenderPipeline = new PointCloudRenderPipelineProvider(
      sceneHandler,
      pointCloudMaterialManager,
      pointCloudParameters
    );

    this._postProcessingPass = new PostProcessingPass(sceneHandler.scene, {
      ssaoTexture: this._renderTargetData.ssaoRenderTarget.texture,
      edges: edges.enabled,
      pointBlending: pointCloudParameters.pointBlending,
      edlOptions: pointCloudParameters.edlOptions,
      ...this._pointCloudRenderPipeline.pointCloudRenderTargets,
      ...this._cadGeometryRenderPipeline.cadGeometryRenderTargets
    });

    this._blitToScreenMaterial = new THREE.RawShaderMaterial({
      vertexShader: blitShaders.vertex,
      fragmentShader: blitShaders.fragment,
      uniforms: {
        tDiffuse: { value: this._renderTargetData.postProcessingRenderTarget.texture },
        tDepth: { value: this._renderTargetData.postProcessingRenderTarget.depthTexture }
      },
      glslVersion: THREE.GLSL3,
      defines: {
        DEPTH_WRITE: true,
        FXAA: true
      }
    });

    this._blitToScreenMesh = createFullScreenTriangleMesh(this._blitToScreenMaterial);

    this.renderOptions = cloneDeep(renderOptions);
  }

  public setOutputRenderTarget(target: THREE.WebGLRenderTarget | null, autoSizeRenderTarget?: boolean): void {
    this._outputRenderTarget = target;
    if (autoSizeRenderTarget) this._autoResizeOutputTarget = autoSizeRenderTarget;
  }

  public *pipeline(renderer: THREE.WebGLRenderer): Generator<RenderPass> {
    this.pipelineSetup(renderer);

    const modelIdentifiers = this._cadModels.map(cadModel => cadModel.modelIdentifier);
    const hasStyling = hasStyledNodes(modelIdentifiers, this._materialManager);

    try {
      yield* this._cadGeometryRenderPipeline.pipeline(renderer);

      renderer.setRenderTarget(this._renderTargetData.ssaoRenderTarget);
      renderer.setClearColor('#FFFFFF', 1.0);
      renderer.clear();

      if (this.shouldRenderSsao(hasStyling.back)) {
        yield this._ssaoPass;
      }

      if (this.shouldRenderPointClouds()) {
        yield* this._pointCloudRenderPipeline.pipeline(renderer);
      }

      this._postProcessingPass.updateRenderObjectsVisibility({
        cad: hasStyling,
        pointCloud: this.shouldRenderPointClouds()
      });
      renderer.setRenderTarget(this._renderTargetData.postProcessingRenderTarget);
      this._rendererStateHelper!.resetState();
      this._rendererStateHelper!.autoClear = true;
      yield this._postProcessingPass;

      renderer.setRenderTarget(this._outputRenderTarget);

      yield {
        render: (renderer, camera) => {
          renderer.render(this._blitToScreenMesh, camera);
        }
      };
    } finally {
      this._rendererStateHelper!.resetState();
    }
  }

  public dispose(): void {
    this._cadGeometryRenderPipeline.dispose();
    this._pointCloudRenderPipeline.dispose();
    this._postProcessingPass.dispose();

    this._renderTargetData.postProcessingRenderTarget.dispose();

    this._blitToScreenMesh.geometry.dispose();
    (this._blitToScreenMesh.material as THREE.Material).dispose();
  }

  private pipelineSetup(renderer: THREE.WebGLRenderer) {
    this._rendererStateHelper = new WebGLRendererStateHelper(renderer);
    this._rendererStateHelper.autoClear = true;
    this._rendererStateHelper.setClearColor(renderer.getClearColor(new THREE.Color()), 0);

    this._cadModels.forEach(cadModel => {
      cadModel.cadNode.matrixAutoUpdate = false;
    });

    this._viewerScene.matrixWorldAutoUpdate = false;

    this._customObjects?.forEach(customObject => customObject.object.updateMatrixWorld(true));

    this.updateRenderTargetSizes(renderer);
  }

  private updateRenderTargetSizes(renderer: THREE.WebGLRenderer): void {
    const renderSize = new THREE.Vector2();
    renderer.getDrawingBufferSize(renderSize);

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

  private shouldRenderSsao(hasBackStyling: boolean): boolean {
    const ssaoSampleSize =
      this.renderOptions?.ssaoRenderParameters?.sampleSize ?? defaultRenderOptions.ssaoRenderParameters.sampleSize;

    return ssaoSampleSize > 0 && hasBackStyling;
  }

  private shouldRenderPointClouds(): boolean {
    return this._pointCloudModels.length > 0;
  }
}
