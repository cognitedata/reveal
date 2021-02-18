/*!
 * Copyright 2021 Cognite AS
 */

import { MaterialManager } from '../MaterialManager';
import { RenderMode } from './RenderMode';
import * as THREE from 'three';

import { CogniteColors, isMobileOrTablet } from '../../../utilities';
import { CadNode } from '..';
import { Cognite3DModel } from '../../../migration';
import { RootSectorNode } from '../sector/RootSectorNode';
import { AntiAliasingMode, defaultRenderOptions, RenderOptions, SsaoParameters } from '../../..';
import { outlineDetectionShaders, fxaaShaders, ssaoShaders, ssaoBlurCombineShaders } from './shaders';
import { SsaoSampleQuality } from '../../../public/types';

export class EffectRenderManager {
  private readonly _materialManager: MaterialManager;
  private readonly _orthographicCamera: THREE.OrthographicCamera;

  // Simple scene with a single triangle with UVs [0,1] in both directions
  // used for combining outputs into a single output
  private readonly _compositionScene: THREE.Scene;

  // Simple scene with a single triangle with UVs [0,1] in both directions
  // used for applying FXAA to the final result
  private readonly _fxaaScene: THREE.Scene;

  // Simple scene with a single triangle with UVs [0,1] in both directions
  // used for generating ambient occlusion map (screen space)
  private readonly _ssaoScene: THREE.Scene;

  // Simple scene with a single triangle with UVs [0,1] in both directions
  // used for bluring and applying the ambient occlusion map (screen space)
  private readonly _ssaoBlurScene: THREE.Scene;

  // Holds all CAD models
  private readonly _cadScene: THREE.Scene;

  // "Working scene" used to hold "normal" objects, i.e.
  // objects that are depth tested and not "ghosted". Populated
  // during render()
  private readonly _normalScene: THREE.Scene;
  // "Working scene" used to hold objects that are rendered in front
  // of other objects. Populated during render().
  private readonly _inFrontScene: THREE.Scene;

  // Special scene needed to properly clear WebGL2 render targets
  private readonly _emptyScene: THREE.Scene;

  // Used to build _normalScene during render()
  private readonly _normalSceneBuilder: TemporarySceneBuilder;
  // Used to build _infrontScene during render()
  private readonly _inFrontSceneBuilder: TemporarySceneBuilder;

  private _isInitialized: boolean = false;
  private _renderOptions: RenderOptions;

  private _combineOutlineDetectionMaterial: THREE.ShaderMaterial;
  private _fxaaMaterial: THREE.ShaderMaterial;
  private _ssaoMaterial: THREE.ShaderMaterial;
  private _ssaoBlurMaterial: THREE.ShaderMaterial;

  private _customObjectRenderTarget: THREE.WebGLRenderTarget;
  private _ghostObjectRenderTarget: THREE.WebGLRenderTarget;
  private _normalRenderedCadModelTarget: THREE.WebGLRenderTarget;
  private _inFrontRenderedCadModelTarget: THREE.WebGLRenderTarget;
  private _compositionTarget: THREE.WebGLRenderTarget;
  private _ssaoTarget: THREE.WebGLRenderTarget;
  private _ssaoBlurTarget: THREE.WebGLRenderTarget;

  /**
   * Holds state of how the last frame was rendered by `render()`. This is used to explicit clear
   * WebGL2 render targets which might cause geometry to "get stuck" after e.g. removing models.
   */
  private _lastFrameSceneState = {
    hasBackElements: true,
    hasInFrontElements: true,
    hasGhostElements: true,
    hasCustomObjects: true
  };

  private readonly _rootSectorNodeBuffer: Set<[RootSectorNode, CadNode]> = new Set();
  private readonly outlineTexelSize = 2;

  private renderTarget: THREE.WebGLRenderTarget | null;
  private autoSetTargetSize: boolean = false;

  public set renderOptions(options: RenderOptions) {
    const ssaoParameters = this.ssaoParameters(options);
    const inputSsaoOptions = { ...ssaoParameters };
    this.setSsaoParameters(inputSsaoOptions);
    this._renderOptions = { ...options, ssaoRenderParameters: { ...ssaoParameters } };
  }

  private ssaoParameters(renderOptions: RenderOptions): SsaoParameters {
    return renderOptions?.ssaoRenderParameters ?? { ...defaultRenderOptions.ssaoRenderParameters };
  }

  private get antiAliasingMode(): AntiAliasingMode {
    const { antiAliasing = defaultRenderOptions.antiAliasing } = this._renderOptions;
    return antiAliasing;
  }

  private get multiSampleCountHint(): number {
    const { multiSampleCountHint = defaultRenderOptions.multiSampleCountHint } = this._renderOptions;
    return multiSampleCountHint;
  }

  constructor(materialManager: MaterialManager, options: RenderOptions) {
    this._renderOptions = options;
    this._materialManager = materialManager;
    this._orthographicCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    this.renderTarget = null;

    this._cadScene = new THREE.Scene();
    this._normalScene = new THREE.Scene();
    this._inFrontScene = new THREE.Scene();
    this._compositionScene = new THREE.Scene();
    this._fxaaScene = new THREE.Scene();
    this._ssaoScene = new THREE.Scene();
    this._ssaoBlurScene = new THREE.Scene();
    this._emptyScene = new THREE.Scene();
    this._normalSceneBuilder = new TemporarySceneBuilder(this._normalScene);
    this._inFrontSceneBuilder = new TemporarySceneBuilder(this._inFrontScene);

    // Initialize dummy targets and materials untill properly initialized
    this._customObjectRenderTarget = this._ghostObjectRenderTarget = this._normalRenderedCadModelTarget = this._inFrontRenderedCadModelTarget = this._compositionTarget = this._ssaoTarget = this._ssaoBlurTarget = new THREE.WebGLRenderTarget(
      0,
      0
    );
    this._combineOutlineDetectionMaterial = new THREE.ShaderMaterial({});
    this._ssaoMaterial = new THREE.ShaderMaterial({});
    this._ssaoBlurMaterial = new THREE.ShaderMaterial({});
    this._fxaaMaterial = new THREE.ShaderMaterial({});
  }

  private ensureInitialized(renderer: THREE.WebGLRenderer) {
    if (this._isInitialized) {
      return;
    }

    const isWebGL2 = renderer.capabilities.isWebGL2;
    const outlineColorTexture = this.createOutlineColorTexture();

    this._inFrontRenderedCadModelTarget = createRenderTarget(isWebGL2, this.multiSampleCountHint, {
      stencilBuffer: false
    });
    this._inFrontRenderedCadModelTarget.depthTexture = new THREE.DepthTexture(0, 0);
    this._inFrontRenderedCadModelTarget.depthTexture.format = THREE.DepthFormat;
    this._inFrontRenderedCadModelTarget.depthTexture.type = THREE.UnsignedIntType;

    this._normalRenderedCadModelTarget = createRenderTarget(isWebGL2, this.multiSampleCountHint, {
      stencilBuffer: false
    });
    this._normalRenderedCadModelTarget.depthTexture = new THREE.DepthTexture(0, 0);
    this._normalRenderedCadModelTarget.depthTexture.format = THREE.DepthFormat;
    this._normalRenderedCadModelTarget.depthTexture.type = THREE.UnsignedIntType;

    this._ghostObjectRenderTarget = createRenderTarget(isWebGL2, this.multiSampleCountHint, { stencilBuffer: false });
    this._ghostObjectRenderTarget.depthTexture = new THREE.DepthTexture(0, 0);
    this._ghostObjectRenderTarget.depthTexture.format = THREE.DepthFormat;
    this._ghostObjectRenderTarget.depthTexture.type = THREE.UnsignedIntType;

    this._customObjectRenderTarget = createRenderTarget(isWebGL2, this.multiSampleCountHint, { stencilBuffer: false });
    this._customObjectRenderTarget.depthTexture = new THREE.DepthTexture(0, 0);
    this._customObjectRenderTarget.depthTexture.format = THREE.DepthFormat;
    this._customObjectRenderTarget.depthTexture.type = THREE.UnsignedIntType;

    this._compositionTarget = new THREE.WebGLRenderTarget(0, 0, { stencilBuffer: false });
    this._compositionTarget.depthTexture = new THREE.DepthTexture(0, 0);
    this._compositionTarget.depthTexture.format = THREE.DepthFormat;
    this._compositionTarget.depthTexture.type = THREE.UnsignedIntType;

    this._ssaoTarget = new THREE.WebGLRenderTarget(0, 0, { stencilBuffer: false });
    this._ssaoTarget.depthTexture = new THREE.DepthTexture(0, 0);
    this._ssaoTarget.depthTexture.format = THREE.DepthFormat;
    this._ssaoTarget.depthTexture.type = THREE.UnsignedIntType;

    this._ssaoBlurTarget = new THREE.WebGLRenderTarget(0, 0, { stencilBuffer: false });
    this._ssaoBlurTarget.depthTexture = new THREE.DepthTexture(0, 0);
    this._ssaoBlurTarget.depthTexture.format = THREE.DepthFormat;
    this._ssaoBlurTarget.depthTexture.type = THREE.UnsignedIntType;

    this._combineOutlineDetectionMaterial = new THREE.ShaderMaterial({
      vertexShader: outlineDetectionShaders.vertex,
      fragmentShader: outlineDetectionShaders.fragment,
      uniforms: {
        tFront: { value: this._inFrontRenderedCadModelTarget.texture },
        tFrontDepth: { value: this._inFrontRenderedCadModelTarget.depthTexture },
        tBack: { value: this._normalRenderedCadModelTarget.texture },
        tBackDepth: { value: this._normalRenderedCadModelTarget.depthTexture },
        tCustom: { value: this._customObjectRenderTarget.texture },
        tCustomDepth: { value: this._customObjectRenderTarget.depthTexture },
        tGhost: { value: this._ghostObjectRenderTarget.texture },
        tGhostDepth: { value: this._ghostObjectRenderTarget.depthTexture },
        tOutlineColors: { value: outlineColorTexture },
        cameraNear: { value: 0.1 },
        cameraFar: { value: 10000 },
        edgeStrengthMultiplier: { value: 2.5 },
        edgeGrayScaleIntensity: { value: 0.1 }
      },
      extensions: { fragDepth: true }
    });

    const noiseTexture = this.createNoiseTexture();

    const ssaoParameters = this.ssaoParameters(this._renderOptions);

    const numberOfSamples = ssaoParameters.sampleSize;
    const sampleKernel = this.createKernel(numberOfSamples);

    const sampleRadius = ssaoParameters.sampleRadius;
    const depthCheckBias = ssaoParameters.depthCheckBias;

    this._ssaoMaterial = new THREE.ShaderMaterial({
      uniforms: {
        tDepth: { value: this._compositionTarget.depthTexture },
        tNoise: { value: noiseTexture },
        kernel: { value: sampleKernel },
        sampleRadius: { value: sampleRadius },
        bias: { value: depthCheckBias },
        projMatrix: { value: new THREE.Matrix4() },
        inverseProjectionMatrix: { value: new THREE.Matrix4() },
        resolution: { value: new THREE.Vector2() }
      },
      defines: {
        MAX_KERNEL_SIZE: numberOfSamples
      },
      vertexShader: ssaoShaders.vertex,
      fragmentShader: ssaoShaders.fragment
    });

    this._ssaoBlurMaterial = new THREE.ShaderMaterial({
      uniforms: {
        tDiffuse: { value: this._compositionTarget.texture },
        tAmbientOcclusion: { value: this._ssaoTarget.texture },
        resolution: { value: new THREE.Vector2() }
      },
      vertexShader: ssaoBlurCombineShaders.vertex,
      fragmentShader: ssaoBlurCombineShaders.fragment
    });

    const diffuseTexture = this.supportsSsao(renderer, ssaoParameters)
      ? this._ssaoBlurTarget.texture
      : this._compositionTarget.texture;

    this._fxaaMaterial = new THREE.ShaderMaterial({
      uniforms: {
        tDiffuse: { value: diffuseTexture },
        tDepth: { value: this._compositionTarget.depthTexture },
        resolution: { value: new THREE.Vector2() },
        inverseResolution: { value: new THREE.Vector2() }
      },
      vertexShader: fxaaShaders.vertex,
      fragmentShader: fxaaShaders.fragment,
      extensions: { fragDepth: true }
    });

    this.setupCompositionScene();
    this.setupSsaoScene();
    this.setupSsaoBlurCombineScene();
    this.setupFxaaScene();

    this._isInitialized = true;
  }

  private supportsSsao(renderer: THREE.WebGLRenderer, ssaoParameters: SsaoParameters) {
    return (
      !isMobileOrTablet() &&
      (renderer.capabilities.isWebGL2 || renderer.extensions.has('EXT_frag_depth')) &&
      ssaoParameters.sampleSize !== SsaoSampleQuality.None
    );
  }

  public render(renderer: THREE.WebGLRenderer, camera: THREE.PerspectiveCamera, scene: THREE.Scene) {
    this.ensureInitialized(renderer);

    const original = {
      autoClear: renderer.autoClear,
      clearAlpha: renderer.getClearAlpha(),
      renderTarget: renderer.getRenderTarget(),
      renderMode: this._materialManager.getRenderMode()
    };
    this.updateRenderSize(renderer);

    this.traverseForRootSectorNode(scene);

    this._rootSectorNodeBuffer.forEach(p => {
      if (p[1].parent !== scene && !(p[1].parent instanceof Cognite3DModel)) {
        throw new Error('CadNode must be put at scene root');
      }
      this._cadScene.add(p[0]);
    });

    try {
      this.updateRenderSize(renderer);

      renderer.info.autoReset = false;
      renderer.info.reset();
      renderer.autoClear = false;

      // Clear targets
      this.clearTarget(renderer, this._ghostObjectRenderTarget);
      this.clearTarget(renderer, this._compositionTarget);
      this.clearTarget(renderer, this._customObjectRenderTarget);
      // We use alpha to store special state for the next targets
      renderer.setClearAlpha(0.0);
      this.clearTarget(renderer, this._normalRenderedCadModelTarget);
      this.clearTarget(renderer, this._inFrontRenderedCadModelTarget);
      renderer.setClearAlpha(original.clearAlpha);

      const lastFrameSceneState = { ...this._lastFrameSceneState };
      const { hasBackElements, hasInFrontElements, hasGhostElements } = this.splitToScenes();
      const hasCustomObjects = scene.children.length > 0;
      this._lastFrameSceneState = { hasBackElements, hasInFrontElements, hasGhostElements, hasCustomObjects };

      if (hasBackElements && !hasGhostElements) {
        this.renderNormalCadModelsFromBaseScene(renderer, camera);
      } else if (hasBackElements && hasGhostElements) {
        this.renderNormalCadModels(renderer, camera);
        this._normalSceneBuilder.restoreOriginalScene();
        this.renderGhostedCadModelsFromBaseScene(renderer, camera);
      } else if (!hasBackElements && hasGhostElements) {
        this.renderGhostedCadModelsFromBaseScene(renderer, camera);
      }

      if (hasInFrontElements) {
        this.renderInFrontCadModels(renderer, camera);
        this._inFrontSceneBuilder.restoreOriginalScene();
      }
      if (hasCustomObjects) {
        this.renderCustomObjects(renderer, scene, camera);
      }

      if (renderer.capabilities.isWebGL2) {
        // Due to how WebGL2 works and how ThreeJS applies changes from 'clear', we need to
        // render something for the clear to have effect
        if (!hasBackElements && lastFrameSceneState.hasBackElements) {
          this.explicitFlushRender(renderer, camera, this._normalRenderedCadModelTarget);
        }
        if (!hasGhostElements && lastFrameSceneState.hasGhostElements) {
          this.explicitFlushRender(renderer, camera, this._ghostObjectRenderTarget);
        }
        if (!hasInFrontElements && lastFrameSceneState.hasInFrontElements) {
          this.explicitFlushRender(renderer, camera, this._inFrontRenderedCadModelTarget);
        }
        if (!hasCustomObjects && lastFrameSceneState.hasInFrontElements) {
          this.explicitFlushRender(renderer, camera, this._customObjectRenderTarget);
        }
      }

      const supportsSsao = this.supportsSsao(renderer, this.ssaoParameters(this._renderOptions));

      switch (this.antiAliasingMode) {
        case AntiAliasingMode.FXAA:
          // Composite view
          this.renderComposition(renderer, camera, this._compositionTarget);

          // Anti-aliased version to screen
          renderer.autoClear = original.autoClear;

          if (supportsSsao) {
            this.renderSsao(renderer, this._ssaoTarget, camera);
            this.renderBlurredSsao(renderer, this._ssaoBlurTarget);
          }

          this.renderAntiAlias(renderer, this.renderTarget);
          break;

        case AntiAliasingMode.NoAA:
          renderer.autoClear = original.autoClear;

          if (supportsSsao) {
            this.renderComposition(renderer, camera, this._compositionTarget);
            this.renderSsao(renderer, this._ssaoTarget, camera);
            this.renderBlurredSsao(renderer, this.renderTarget);
          } else {
            this.renderComposition(renderer, camera, this.renderTarget);
          }
          break;

        default:
          throw new Error(`Unsupported anti-aliasing mode: ${this.antiAliasingMode}`);
      }
    } finally {
      // Restore state
      renderer.autoClear = original.autoClear;
      renderer.setClearAlpha(original.clearAlpha);
      renderer.setRenderTarget(original.renderTarget);
      this._materialManager.setRenderMode(original.renderMode);

      this._rootSectorNodeBuffer.forEach(p => {
        p[1].add(p[0]);
      });
      this._rootSectorNodeBuffer.clear();
    }
  }

  public setRenderTarget(target: THREE.WebGLRenderTarget | null, autoSetTargetSize: boolean = true) {
    this.autoSetTargetSize = autoSetTargetSize;
    this.renderTarget = target;
  }

  private clearTarget(renderer: THREE.WebGLRenderer, target: THREE.WebGLRenderTarget | null) {
    renderer.setRenderTarget(target);
    renderer.clear();
  }

  private explicitFlushRender(
    renderer: THREE.WebGLRenderer,
    camera: THREE.Camera,
    target: THREE.WebGLRenderTarget | null
  ) {
    renderer.setRenderTarget(target);
    renderer.render(this._emptyScene, camera);
  }

  private splitToScenes(): { hasBackElements: boolean; hasInFrontElements: boolean; hasGhostElements: boolean } {
    const result = { hasBackElements: false, hasInFrontElements: false, hasGhostElements: false };
    this._rootSectorNodeBuffer.forEach(rootSectorNodeData => {
      const cadNode: CadNode = rootSectorNodeData[1];
      const root: RootSectorNode = rootSectorNodeData[0];

      const backSet = this._materialManager.getModelBackTreeIndices(cadNode.cadModelMetadata.blobUrl);
      const infrontSet = this._materialManager.getModelInFrontTreeIndices(cadNode.cadModelMetadata.blobUrl);
      const ghostSet = this._materialManager.getModelGhostedTreeIndices(cadNode.cadModelMetadata.blobUrl);
      const hasBackElements = backSet.size > 0;
      const hasInFrontElements = infrontSet.size > 0;
      const hasGhostElements = ghostSet.size > 0;
      result.hasBackElements = result.hasBackElements || hasBackElements;
      result.hasInFrontElements = result.hasInFrontElements || hasInFrontElements;
      result.hasGhostElements = result.hasGhostElements || hasGhostElements;

      const backRoot = new THREE.Object3D();
      backRoot.applyMatrix4(root.matrix);
      if (hasBackElements && hasGhostElements) {
        this._normalScene.add(backRoot);
      }

      const infrontRoot = new THREE.Object3D();
      infrontRoot.applyMatrix4(root.matrix);
      if (hasInFrontElements) {
        this._inFrontScene.add(infrontRoot);
      }

      const objectStack: THREE.Object3D[] = [rootSectorNodeData[0]];
      while (objectStack.length > 0) {
        const element = objectStack.pop()!;
        const objectTreeIndices = element.userData.treeIndices as Set<number> | undefined;

        if (objectTreeIndices) {
          if (hasInFrontElements && hasIntersection(infrontSet, objectTreeIndices)) {
            this._inFrontSceneBuilder.addElement(element, infrontRoot);
          }
          // Note! When we don't have any ghost, we use _cadScene to hold back objects, so no action required
          if (hasBackElements && !hasGhostElements) {
          } else if (hasGhostElements && hasIntersection(backSet, objectTreeIndices)) {
            this._normalSceneBuilder.addElement(element, backRoot);
            // Use _cadScene to hold ghost objects (we assume we have more ghost objects than back objects)
          }

          // TODO 2020-09-18 larsmoa: A potential optimization to rendering is to avoid rendering the full
          // set of objects if most are hidden.
        } else {
          // Not a leaf, traverse children
          objectStack.push(...element.children);
        }
      }
    });

    return result;
  }

  private renderNormalCadModels(renderer: THREE.WebGLRenderer, camera: THREE.PerspectiveCamera) {
    this._normalSceneBuilder.populateTemporaryScene();
    renderer.setRenderTarget(this._normalRenderedCadModelTarget);
    this._materialManager.setRenderMode(RenderMode.Color);
    renderer.render(this._normalScene, camera);
  }

  private renderNormalCadModelsFromBaseScene(renderer: THREE.WebGLRenderer, camera: THREE.PerspectiveCamera) {
    renderer.setRenderTarget(this._normalRenderedCadModelTarget);
    this._materialManager.setRenderMode(RenderMode.Color);
    renderer.render(this._cadScene, camera);
  }

  private renderInFrontCadModels(renderer: THREE.WebGLRenderer, camera: THREE.PerspectiveCamera) {
    this._inFrontSceneBuilder.populateTemporaryScene();
    renderer.setRenderTarget(this._inFrontRenderedCadModelTarget);
    this._materialManager.setRenderMode(RenderMode.Effects);
    renderer.render(this._inFrontScene, camera);
  }

  private renderGhostedCadModelsFromBaseScene(renderer: THREE.WebGLRenderer, camera: THREE.PerspectiveCamera) {
    renderer.setRenderTarget(this._ghostObjectRenderTarget);
    this._materialManager.setRenderMode(RenderMode.Ghost);
    renderer.render(this._cadScene, camera);
  }

  private renderCustomObjects(renderer: THREE.WebGLRenderer, scene: THREE.Scene, camera: THREE.PerspectiveCamera) {
    renderer.setRenderTarget(this._customObjectRenderTarget);
    renderer.render(scene, camera);
  }

  private updateRenderSize(renderer: THREE.WebGLRenderer) {
    const renderSize = new THREE.Vector2();
    renderer.getSize(renderSize);

    if (
      this.renderTarget &&
      this.autoSetTargetSize &&
      renderSize.x !== this.renderTarget.width &&
      renderSize.y !== this.renderTarget.height
    ) {
      this.renderTarget.setSize(renderSize.x, renderSize.y);
    }

    if (
      renderSize.x !== this._normalRenderedCadModelTarget.width ||
      renderSize.y !== this._normalRenderedCadModelTarget.height
    ) {
      this._normalRenderedCadModelTarget.setSize(renderSize.x, renderSize.y);
      this._inFrontRenderedCadModelTarget.setSize(renderSize.x, renderSize.y);
      this._customObjectRenderTarget.setSize(renderSize.x, renderSize.y);
      this._ghostObjectRenderTarget.setSize(renderSize.x, renderSize.y);
      this._compositionTarget.setSize(renderSize.x, renderSize.y);
      this._ssaoTarget.setSize(renderSize.x, renderSize.y);
      this._ssaoBlurTarget.setSize(renderSize.x, renderSize.y);

      // Update GLSL uniforms related to resolution
      this._combineOutlineDetectionMaterial.setValues({
        uniforms: {
          ...this._combineOutlineDetectionMaterial.uniforms,
          texelSize: {
            value: new THREE.Vector2(this.outlineTexelSize / renderSize.x, this.outlineTexelSize / renderSize.y)
          },
          resolution: { value: new THREE.Vector2(renderSize.x, renderSize.y) }
        }
      });

      this._ssaoMaterial.setValues({
        uniforms: {
          ...this._ssaoMaterial.uniforms,
          resolution: { value: renderSize }
        }
      });

      this._ssaoBlurMaterial.setValues({
        uniforms: {
          ...this._ssaoBlurMaterial.uniforms,
          resolution: { value: renderSize }
        }
      });

      this._fxaaMaterial.setValues({
        uniforms: {
          ...this._fxaaMaterial.uniforms,
          resolution: { value: renderSize },
          inverseResolution: { value: new THREE.Vector2(1.0 / renderSize.x, 1.0 / renderSize.y) }
        }
      });
    }
    return renderSize;
  }

  private renderComposition(
    renderer: THREE.WebGLRenderer,
    camera: THREE.PerspectiveCamera,
    target: THREE.WebGLRenderTarget | null
  ) {
    this._combineOutlineDetectionMaterial.uniforms.cameraNear.value = camera.near;
    this._combineOutlineDetectionMaterial.uniforms.cameraFar.value = camera.far;

    renderer.setRenderTarget(target);
    renderer.render(this._compositionScene, this._orthographicCamera);
  }

  private setSsaoParameters(params: SsaoParameters) {
    if (!this._isInitialized) return;

    const defaultSsaoParameters = defaultRenderOptions.ssaoRenderParameters;

    this._ssaoMaterial.uniforms.sampleRadius.value = params.sampleRadius;
    this._ssaoMaterial.uniforms.bias.value = params.depthCheckBias;

    if (params.sampleSize !== this.ssaoParameters(this._renderOptions).sampleSize) {
      const sampleSize = params?.sampleSize ?? defaultSsaoParameters.sampleSize!;

      const kernel = this.createKernel(sampleSize);

      this._fxaaMaterial.uniforms.tDiffuse.value =
        params.sampleSize !== SsaoSampleQuality.None ? this._ssaoBlurTarget.texture : this._compositionTarget.texture;

      this._ssaoMaterial.uniforms.kernel.value = kernel;

      this._ssaoMaterial.defines = {
        MAX_KERNEL_SIZE: sampleSize
      };

      this._ssaoMaterial.needsUpdate = true;
    }
  }

  private renderSsao(renderer: THREE.WebGLRenderer, target: THREE.WebGLRenderTarget | null, camera: THREE.Camera) {
    this._ssaoMaterial.uniforms.inverseProjectionMatrix.value = camera.projectionMatrixInverse;
    this._ssaoMaterial.uniforms.projMatrix.value = camera.projectionMatrix;

    renderer.setRenderTarget(target);
    renderer.render(this._ssaoScene, this._orthographicCamera);
  }

  private renderBlurredSsao(renderer: THREE.WebGLRenderer, target: THREE.WebGLRenderTarget | null) {
    renderer.setRenderTarget(target);
    renderer.render(this._ssaoBlurScene, this._orthographicCamera);
  }

  private renderAntiAlias(renderer: THREE.WebGLRenderer, target: THREE.WebGLRenderTarget | null) {
    renderer.setRenderTarget(target);
    renderer.render(this._fxaaScene, this._orthographicCamera);
  }

  private createOutlineColorTexture(): THREE.DataTexture {
    const outlineColorBuffer = new Uint8Array(8 * 4);
    const outlineColorTexture = new THREE.DataTexture(outlineColorBuffer, 8, 1);
    setOutlineColor(outlineColorTexture.image.data, 1, CogniteColors.White);
    setOutlineColor(outlineColorTexture.image.data, 2, CogniteColors.Black);
    setOutlineColor(outlineColorTexture.image.data, 3, CogniteColors.Cyan);
    setOutlineColor(outlineColorTexture.image.data, 4, CogniteColors.Blue);
    setOutlineColor(outlineColorTexture.image.data, 5, CogniteColors.Purple);
    setOutlineColor(outlineColorTexture.image.data, 6, CogniteColors.Pink);
    setOutlineColor(outlineColorTexture.image.data, 7, CogniteColors.Orange);
    return outlineColorTexture;
  }

  private setupCompositionScene() {
    const geometry = this.createRenderTriangle();
    const mesh = new THREE.Mesh(geometry, this._combineOutlineDetectionMaterial);
    this._compositionScene.add(mesh);
  }

  private setupFxaaScene() {
    const geometry = this.createRenderTriangle();
    const mesh = new THREE.Mesh(geometry, this._fxaaMaterial);
    this._fxaaScene.add(mesh);
  }

  private setupSsaoScene() {
    const geometry = this.createRenderTriangle();
    const mesh = new THREE.Mesh(geometry, this._ssaoMaterial);
    this._ssaoScene.add(mesh);
  }

  private setupSsaoBlurCombineScene() {
    const geometry = this.createRenderTriangle();
    const mesh = new THREE.Mesh(geometry, this._ssaoBlurMaterial);
    this._ssaoBlurScene.add(mesh);
  }

  private createNoiseTexture() {
    const width = 128;
    const height = 128;

    const size = width * height;
    const data = new Float32Array(size * 4);

    for (let i = 0; i < size; i++) {
      const stride = i * 4;

      const x = Math.random() * 2 - 1;
      const y = Math.random() * 2 - 1;
      const z = Math.random() * 2 - 1;

      data[stride] = x;
      data[stride + 1] = y;
      data[stride + 2] = z;
      data[stride + 3] = 1;
    }

    const result = new THREE.DataTexture(data, width, height, THREE.RGBAFormat, THREE.FloatType);
    result.wrapS = THREE.RepeatWrapping;
    result.wrapT = THREE.RepeatWrapping;
    return result;
  }

  private createKernel(kernelSize: number) {
    const result = [];
    for (let i = 0; i < kernelSize; i++) {
      const sample = new THREE.Vector3();
      while (sample.length() < 0.5) {
        // Ensure some distance in samples
        sample.x = Math.random() * 2 - 1;
        sample.y = Math.random() * 2 - 1;
        sample.z = Math.random();
      }
      sample.normalize();
      let scale = i / kernelSize;
      scale = lerp(0.1, 1, scale * scale);
      sample.multiplyScalar(scale);
      result.push(sample);
    }
    return result;

    function lerp(value1: number, value2: number, amount: number) {
      amount = amount < 0 ? 0 : amount;
      amount = amount > 1 ? 1 : amount;
      return value1 + (value2 - value1) * amount;
    }
  }

  private createRenderTriangle() {
    const geometry = new THREE.Geometry();
    geometry.vertices.push(new THREE.Vector3(-1, -1, 0));
    geometry.vertices.push(new THREE.Vector3(3, -1, 0));
    geometry.vertices.push(new THREE.Vector3(-1, 3, 0));

    const face = new THREE.Face3(0, 1, 2);
    geometry.faces.push(face);

    geometry.faceVertexUvs[0].push([new THREE.Vector2(0, 0), new THREE.Vector2(2, 0), new THREE.Vector2(0, 2)]);

    return geometry;
  }

  private traverseForRootSectorNode(root: THREE.Object3D) {
    const objectStack = [root];

    while (objectStack.length > 0) {
      const element = objectStack.pop()!;
      if (element instanceof RootSectorNode) {
        this._rootSectorNodeBuffer.add([element, element.parent! as CadNode]);
      } else if (!(element instanceof THREE.Group)) {
        objectStack.push(...element.children);
      }
    }
  }
}

function createRenderTarget(
  isWebGL2: boolean,
  multiSampleCountHint: number,
  options?: THREE.WebGLRenderTargetOptions
): THREE.WebGLRenderTarget {
  if (isWebGL2 && multiSampleCountHint > 1) {
    const rt = new THREE.WebGLMultisampleRenderTarget(0, 0, options);
    rt.samples = multiSampleCountHint;
    return rt;
  }
  return new THREE.WebGLRenderTarget(0, 0, options);
}

function setOutlineColor(outlineTextureData: Uint8ClampedArray, colorIndex: number, color: THREE.Color) {
  outlineTextureData[4 * colorIndex + 0] = Math.floor(255 * color.r);
  outlineTextureData[4 * colorIndex + 1] = Math.floor(255 * color.g);
  outlineTextureData[4 * colorIndex + 2] = Math.floor(255 * color.b);
  outlineTextureData[4 * colorIndex + 3] = 255;
}

function hasIntersection(left: Set<number>, right: Set<number>): boolean {
  // Can we improve performance by using a bloom filter before comparing full sets?
  const needles = left.size < right.size ? left : right;
  const haystack = left.size > right.size ? left : right;

  let intersects = false;
  const it = needles.values();
  let itCurr = it.next();
  while (!intersects && !itCurr.done) {
    intersects = haystack.has(itCurr.value);
    itCurr = it.next();
  }

  return intersects;
}

/**
 * Holds parent-child relationship for a ThreeJS element in order to restore
 * the relationship after moving it temporarily.
 */
type Object3DStructure = {
  /**
   * Element described.
   */
  object: THREE.Object3D;
  /**
   * The previous parent of the element.
   */
  parent: THREE.Object3D;
  /**
   * The object that temporarily holds the elemnt.
   */
  sceneParent: THREE.Object3D;
};

class TemporarySceneBuilder {
  private readonly buffer: Object3DStructure[];
  private readonly temporaryScene: THREE.Scene;

  constructor(temporaryScene: THREE.Scene) {
    this.buffer = [];
    this.temporaryScene = temporaryScene;
  }

  addElement(element: THREE.Object3D, temporaryModelRootElement: THREE.Object3D): void {
    this.buffer.push({ object: element, parent: element.parent!, sceneParent: temporaryModelRootElement });
  }

  populateTemporaryScene(): void {
    this.buffer.forEach(x => x.sceneParent.add(x.object));
  }

  restoreOriginalScene(): void {
    this.buffer.forEach(p => {
      p.parent.add(p.object);
    });
    this.buffer.length = 0; // clear
    this.temporaryScene.remove(...this.temporaryScene.children);
  }
}
