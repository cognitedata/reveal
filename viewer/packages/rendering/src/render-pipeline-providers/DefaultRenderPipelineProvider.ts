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
import { SceneHandler, WebGLRendererStateHelper } from '@reveal/utilities';

export class DefaultRenderPipelineProvider implements RenderPipelineProvider {
  private readonly _cadScene: THREE.Scene;
  private readonly _renderTargetData: RenderTargetData;
  private readonly _cadModels: {
    object: THREE.Object3D;
    modelIdentifier: string;
  }[];
  private readonly _customObjects: THREE.Object3D[];
  private readonly _autoResizeOutputTarget: boolean;
  private readonly _outputRenderTarget: THREE.WebGLRenderTarget | null;
  private readonly _cadGeometryRenderPipeline: CadGeometryRenderPipelineProvider;
  private readonly _postProcessingRenderPipeline: PostProcessingPass;
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
    sceneHandler: SceneHandler,
    renderOptions: RenderOptions,
    outputRenderTarget?: {
      target: THREE.WebGLRenderTarget;
      autoSize?: boolean;
    }
  ) {
    this._materialManager = materialManager;
    this._cadScene = sceneHandler.scene;
    this._autoResizeOutputTarget = outputRenderTarget?.autoSize ?? true;
    this._outputRenderTarget = outputRenderTarget?.target ?? null;

    this._renderTargetData = {
      currentRenderSize: new THREE.Vector2(1, 1),
      ssaoRenderTarget: createRenderTarget(),
      postProcessingRenderTarget: createRenderTarget()
    };
    this._cadModels = sceneHandler.cadModels;
    this._customObjects = sceneHandler.customObjects;

    const ssaoParameters = renderOptions.ssaoRenderParameters ?? defaultRenderOptions.ssaoRenderParameters;
    const edges = renderOptions.edgeDetectionParameters ?? defaultRenderOptions.edgeDetectionParameters;

    this._cadGeometryRenderPipeline = new CadGeometryRenderPipelineProvider(
      sceneHandler,
      materialManager,
      renderOptions
    );
    this._ssaoPass = new SSAOPass(
      this._cadGeometryRenderPipeline.cadGeometryRenderTargets.back.depthTexture,
      ssaoParameters
    );

    this._postProcessingRenderPipeline = new PostProcessingPass(sceneHandler.scene, {
      ssaoTexture: this._renderTargetData.ssaoRenderTarget.texture,
      edges: edges.enabled,
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

      this._postProcessingRenderPipeline.updateRenderObjectsVisability(hasStyling);
      renderer.setRenderTarget(this._renderTargetData.postProcessingRenderTarget);
      this._rendererStateHelper!.resetState();
      this._rendererStateHelper!.autoClear = true;
      yield this._postProcessingRenderPipeline;

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
    this._postProcessingRenderPipeline.dispose();

    this._renderTargetData.postProcessingRenderTarget.dispose();

    this._blitToScreenMesh.geometry.dispose();
    (this._blitToScreenMesh.material as THREE.Material).dispose();
  }

  private pipelineSetup(renderer: THREE.WebGLRenderer) {
    this._rendererStateHelper = new WebGLRendererStateHelper(renderer);
    this._rendererStateHelper.autoClear = true;
    this._rendererStateHelper.setClearColor(renderer.getClearColor(new THREE.Color()), 0);

    this._cadModels.forEach(cadModel => {
      cadModel.object.matrixAutoUpdate = false;
    });
    this._cadScene.autoUpdate = false;

    this._customObjects?.forEach(customObject => customObject.updateMatrixWorld(true));

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
}
