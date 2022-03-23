/*!
 * Copyright 2021 Cognite AS
 */

import * as THREE from 'three';

import { CadMaterialManager } from '../CadMaterialManager';
import { CogniteColors, RevealColors } from '../utilities/types';
import { CadNode } from '../sector/CadNode';
import { AntiAliasingMode, defaultRenderOptions, RenderOptions, SsaoParameters, SsaoSampleQuality } from './types';

import { NodeOutlineColor } from '@reveal/cad-styling';
import { outlineDetectionShaders, fxaaShaders, ssaoShaders, ssaoBlurCombineShaders } from './shaders';

import { RenderMode } from './RenderMode';

import { LevelOfDetail, RootSectorNode, SectorNode } from '@reveal/cad-parsers';
import { isMobileOrTablet, WebGLRendererStateHelper } from '@reveal/utilities';

import log from '@reveal/logger';

export class EffectRenderManager {
  private readonly _materialManager: CadMaterialManager;
  private readonly _orthographicCamera: THREE.OrthographicCamera;

  // Original input scene containing all geometry
  private readonly _originalScene: THREE.Scene;

  // Simple scene with a single triangle with UVs [0,1] in both directions
  // used for combining outputs into a single output
  private readonly _compositionScene: THREE.Scene;

  // Simple scene with a single triangle with UVs [0,1] in both directions
  // used for applying FXAA to the final result
  private readonly _fxaaScene: THREE.Scene;

  // Simple scene with a single triangle with UVs [0,1] in both directions
  // used for generating ambient occlusion map (screen space)
  private readonly _ssaoScene: THREE.Scene;

  // Simple scene used for blurring SSAO result and
  // combining with rendered frame
  private readonly _ssaoBlurCombineScene: THREE.Scene;

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

  private _renderOptions: RenderOptions;

  private readonly _combineOutlineDetectionMaterial: THREE.RawShaderMaterial;
  private readonly _fxaaMaterial: THREE.RawShaderMaterial;
  private _ssaoMaterial: THREE.RawShaderMaterial;
  private readonly _ssaoBlurCombineMaterial: THREE.RawShaderMaterial;

  private readonly _customObjectRenderTarget: THREE.WebGLRenderTarget;
  private readonly _ghostObjectRenderTarget: THREE.WebGLRenderTarget;
  private readonly _normalRenderedCadModelTarget: THREE.WebGLRenderTarget;
  private readonly _inFrontRenderedCadModelTarget: THREE.WebGLRenderTarget;
  private readonly _compositionTarget: THREE.WebGLRenderTarget;
  private readonly _ssaoTarget: THREE.WebGLRenderTarget;
  private readonly _ssaoBlurCombineTarget: THREE.WebGLRenderTarget;

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
  private readonly _outlineTexelSize = 2;

  private readonly _renderer: THREE.WebGLRenderer;
  private _renderTarget: THREE.WebGLRenderTarget | null;
  private _autoSetTargetSize: boolean = false;
  private _debugRenderTimings: boolean = false;

  private _uiObjects: { object: THREE.Object3D; screenPos: THREE.Vector2; width: number; height: number }[] = [];

  public set renderOptions(options: RenderOptions) {
    const ssaoParameters = this.ssaoParameters(options);
    const inputSsaoOptions = { ...ssaoParameters };
    this.setSsaoParameters(inputSsaoOptions);
    this._renderOptions = { ...options, ssaoRenderParameters: { ...ssaoParameters } };
  }

  public set debugRenderTimings(logTimings: boolean) {
    this._debugRenderTimings = logTimings;
  }

  public get debugRenderTimings(): boolean {
    return this._debugRenderTimings;
  }

  public addUiObject(object: THREE.Object3D, screenPos: THREE.Vector2, size: THREE.Vector2): void {
    this._uiObjects.push({ object: object, screenPos, width: size.x, height: size.y });
  }

  public removeUiObject(object: THREE.Object3D): void {
    this._uiObjects = this._uiObjects.filter(p => {
      const filteredObject = p.object;
      return object !== filteredObject;
    });
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

  constructor(
    renderer: THREE.WebGLRenderer,
    scene: THREE.Scene,
    materialManager: CadMaterialManager,
    options: RenderOptions
  ) {
    this._renderer = renderer;
    this._renderOptions = options;
    this._materialManager = materialManager;
    this._orthographicCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, -1, 1);

    this._renderTarget = null;

    this._originalScene = scene;
    this._cadScene = new THREE.Scene();
    this._cadScene.autoUpdate = false;
    this._normalScene = new THREE.Scene();
    this._normalScene.autoUpdate = false;
    this._inFrontScene = new THREE.Scene();
    this._inFrontScene.autoUpdate = false;
    this._compositionScene = new THREE.Scene();
    this._compositionScene.autoUpdate = false;
    this._fxaaScene = new THREE.Scene();
    this._fxaaScene.autoUpdate = false;
    this._ssaoScene = new THREE.Scene();
    this._ssaoScene.autoUpdate = false;
    this._ssaoBlurCombineScene = new THREE.Scene();
    this._ssaoBlurCombineScene.autoUpdate = false;
    this._emptyScene = new THREE.Scene();
    this._emptyScene.autoUpdate = false;

    const outlineColorTexture = this.createOutlineColorTexture();

    this._inFrontRenderedCadModelTarget = createRenderTarget(this.multiSampleCountHint, {
      stencilBuffer: false
    });
    this._inFrontRenderedCadModelTarget.depthTexture = new THREE.DepthTexture(1, 1);
    this._inFrontRenderedCadModelTarget.depthTexture.format = THREE.DepthFormat;
    this._inFrontRenderedCadModelTarget.depthTexture.type = THREE.UnsignedIntType;

    this._normalRenderedCadModelTarget = createRenderTarget(this.multiSampleCountHint, {
      stencilBuffer: false
    });
    this._normalRenderedCadModelTarget.depthTexture = new THREE.DepthTexture(1, 1);
    this._normalRenderedCadModelTarget.depthTexture.format = THREE.DepthFormat;
    this._normalRenderedCadModelTarget.depthTexture.type = THREE.UnsignedIntType;

    this._ghostObjectRenderTarget = createRenderTarget(this.multiSampleCountHint, { stencilBuffer: false });
    this._ghostObjectRenderTarget.depthTexture = new THREE.DepthTexture(1, 1);
    this._ghostObjectRenderTarget.depthTexture.format = THREE.DepthFormat;
    this._ghostObjectRenderTarget.depthTexture.type = THREE.UnsignedIntType;

    this._customObjectRenderTarget = createRenderTarget(this.multiSampleCountHint, { stencilBuffer: false });
    this._customObjectRenderTarget.depthTexture = new THREE.DepthTexture(1, 1);
    this._customObjectRenderTarget.depthTexture.format = THREE.DepthFormat;
    this._customObjectRenderTarget.depthTexture.type = THREE.UnsignedIntType;

    this._compositionTarget = new THREE.WebGLRenderTarget(1, 1, { stencilBuffer: false });
    this._compositionTarget.depthTexture = new THREE.DepthTexture(1, 1);
    this._compositionTarget.depthTexture.format = THREE.DepthFormat;
    this._compositionTarget.depthTexture.type = THREE.UnsignedIntType;

    this._ssaoTarget = new THREE.WebGLRenderTarget(1, 1, { stencilBuffer: false });
    this._ssaoTarget.depthTexture = new THREE.DepthTexture(1, 1);
    this._ssaoTarget.depthTexture.format = THREE.DepthFormat;
    this._ssaoTarget.depthTexture.type = THREE.UnsignedIntType;

    this._ssaoBlurCombineTarget = new THREE.WebGLRenderTarget(1, 1, { stencilBuffer: false });
    this._ssaoBlurCombineTarget.depthTexture = new THREE.DepthTexture(1, 1);
    this._ssaoBlurCombineTarget.depthTexture.format = THREE.DepthFormat;
    this._ssaoBlurCombineTarget.depthTexture.type = THREE.UnsignedIntType;

    this._combineOutlineDetectionMaterial = new THREE.RawShaderMaterial({
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
        resolution: { value: new THREE.Vector2(0, 0) },
        texelSize: { value: new THREE.Vector2(0, 0) },
        cameraNear: { value: 0.1 },
        cameraFar: { value: 10000 },
        edgeStrengthMultiplier: { value: 2.5 },
        edgeGrayScaleIntensity: { value: 0.1 }
      },
      defines: {
        EDGES:
          this._renderOptions.edgeDetectionParameters?.enabled ?? defaultRenderOptions.edgeDetectionParameters.enabled
      },
      glslVersion: THREE.GLSL3
    });

    const ssaoParameters = this.ssaoParameters(this._renderOptions);

    const numberOfSamples = ssaoParameters.sampleSize;
    const sampleKernel = this.createKernel(numberOfSamples);

    const sampleRadius = ssaoParameters.sampleRadius;
    const depthCheckBias = ssaoParameters.depthCheckBias;

    this._ssaoMaterial = new THREE.RawShaderMaterial({
      uniforms: {
        tDepth: { value: this._compositionTarget.depthTexture },
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
      fragmentShader: ssaoShaders.fragment,
      glslVersion: THREE.GLSL3
    });

    this._ssaoBlurCombineMaterial = new THREE.RawShaderMaterial({
      uniforms: {
        tDiffuse: { value: this._compositionTarget.texture },
        tAmbientOcclusion: { value: this._ssaoTarget.texture },
        resolution: { value: new THREE.Vector2() }
      },
      vertexShader: ssaoBlurCombineShaders.vertex,
      fragmentShader: ssaoBlurCombineShaders.fragment,
      glslVersion: THREE.GLSL3
    });

    const diffuseTexture = this.supportsSsao(ssaoParameters)
      ? this._ssaoBlurCombineTarget.texture
      : this._compositionTarget.texture;

    this._fxaaMaterial = new THREE.RawShaderMaterial({
      uniforms: {
        tDiffuse: { value: diffuseTexture },
        tDepth: { value: this._compositionTarget.depthTexture },
        resolution: { value: new THREE.Vector2() },
        inverseResolution: { value: new THREE.Vector2() }
      },
      vertexShader: fxaaShaders.vertex,
      fragmentShader: fxaaShaders.fragment,
      glslVersion: THREE.GLSL3
    });

    this.setupCompositionScene();
    this.setupSsaoScene();
    this.setupSsaoBlurCombineScene();
    this.setupFxaaScene();

    this._normalSceneBuilder = new TemporarySceneBuilder(this._normalScene);
    this._inFrontSceneBuilder = new TemporarySceneBuilder(this._inFrontScene);
  }

  private supportsSsao(ssaoParameters: SsaoParameters) {
    return !isMobileOrTablet() && ssaoParameters.sampleSize !== SsaoSampleQuality.None;
  }

  public renderDetailedToDepthOnly(camera: THREE.PerspectiveCamera): void {
    const original = {
      renderMode: this._materialManager.getRenderMode()
    };
    const renderStateHelper = new WebGLRendererStateHelper(this._renderer);
    this._materialManager.setRenderMode(RenderMode.DepthBufferOnly);

    try {
      renderStateHelper.setRenderTarget(this._renderTarget);
      this.setVisibilityOfSectors(LevelOfDetail.Simple, false);
      this.traverseForRootSectorNode(this._originalScene);
      this.extractCadNodes(this._originalScene);

      this.clearTarget(this._renderTarget);
      const { hasBackElements, hasInFrontElements, hasGhostElements } = this.splitToScenes();

      if (hasBackElements && !hasGhostElements) {
        this.renderNormalCadModelsFromBaseScene(camera, this._renderTarget);
      } else if (hasBackElements && hasGhostElements) {
        this.renderNormalCadModels(camera, this._renderTarget);
        this._normalSceneBuilder.restoreOriginalScene();
      }
      if (hasInFrontElements) {
        this.renderInFrontCadModels(camera);
        this._inFrontSceneBuilder.restoreOriginalScene();
      }
    } finally {
      this._materialManager.setRenderMode(original.renderMode);
      renderStateHelper.resetState();
      this.restoreCadNodes();
      this.setVisibilityOfSectors(LevelOfDetail.Simple, true);
    }
  }

  public render(camera: THREE.PerspectiveCamera): void {
    this.setupRenderTargetSpectorDebugging();
    if (this._debugRenderTimings) {
      log.debug('============== RENDER BEGIN ==============');
    }

    const renderer = this._renderer;
    const scene = this._originalScene;

    const renderStateHelper = new WebGLRendererStateHelper(renderer);
    const original = {
      autoClear: renderer.autoClear,
      clearAlpha: renderer.getClearAlpha(),
      renderMode: this._materialManager.getRenderMode()
    };

    renderer.info.autoReset = false;
    renderer.info.reset();
    renderStateHelper.autoClear = false;

    try {
      renderStateHelper.setRenderTarget(this._renderTarget);
      this.updateRenderSize(renderer);

      renderer.info.autoReset = false;
      renderer.info.reset();
      renderStateHelper.autoClear = false;

      this.traverseForRootSectorNode(scene);
      this.extractCadNodes(scene);

      // Clear targets
      this.clearTarget(this._ghostObjectRenderTarget);
      this.clearTarget(this._compositionTarget);
      this.clearTarget(this._customObjectRenderTarget);
      // We use alpha to store special state for the next targets
      renderer.setClearAlpha(0.0);
      this.clearTarget(this._normalRenderedCadModelTarget);
      this.clearTarget(this._inFrontRenderedCadModelTarget);
      renderer.setClearAlpha(original.clearAlpha);

      const lastFrameSceneState = { ...this._lastFrameSceneState };
      const { hasBackElements, hasInFrontElements, hasGhostElements } = this.splitToScenes();
      const hasCustomObjects = scene.children.length > 0;
      this._lastFrameSceneState = { hasBackElements, hasInFrontElements, hasGhostElements, hasCustomObjects };

      if (hasBackElements && !hasGhostElements) {
        this.renderNormalCadModelsFromBaseScene(camera);
      } else if (hasBackElements && hasGhostElements) {
        this.renderNormalCadModels(camera);
        this._normalSceneBuilder.restoreOriginalScene();
        this.renderGhostedCadModelsFromBaseScene(camera);
      } else if (!hasBackElements && hasGhostElements) {
        this.renderGhostedCadModelsFromBaseScene(camera);
      }

      if (hasInFrontElements) {
        this.renderInFrontCadModels(camera);
        this._inFrontSceneBuilder.restoreOriginalScene();
      }
      if (hasCustomObjects) {
        this.renderCustomObjects(scene, camera);
      }

      // Due to how WebGL2 works and how ThreeJS applies changes from 'clear', we need to
      // render something for the clear to have effect
      if (!hasBackElements && lastFrameSceneState.hasBackElements) {
        this.explicitFlushRender(camera, this._normalRenderedCadModelTarget);
      }
      if (!hasGhostElements && lastFrameSceneState.hasGhostElements) {
        this.explicitFlushRender(camera, this._ghostObjectRenderTarget);
      }
      if (!hasInFrontElements && lastFrameSceneState.hasInFrontElements) {
        this.explicitFlushRender(camera, this._inFrontRenderedCadModelTarget);
      }
      if (!hasCustomObjects && lastFrameSceneState.hasInFrontElements) {
        this.explicitFlushRender(camera, this._customObjectRenderTarget);
      }

      const supportsSsao = this.supportsSsao(this.ssaoParameters(this._renderOptions));

      switch (this.antiAliasingMode) {
        case AntiAliasingMode.FXAA:
          // Composite view
          this.renderComposition(camera, this._compositionTarget);

          // Anti-aliased version to screen
          renderStateHelper.autoClear = original.autoClear;

          if (supportsSsao) {
            this.renderSsao(this._ssaoTarget, camera);
            this.renderPostProcessStep('ssao-blur-combine', this._ssaoBlurCombineTarget, this._ssaoBlurCombineScene);
          }

          this.renderPostProcessStep('fxaa', this._renderTarget, this._fxaaScene);
          break;

        case AntiAliasingMode.NoAA:
          renderer.autoClear = original.autoClear;

          if (supportsSsao) {
            this.renderComposition(camera, this._compositionTarget);

            this.renderSsao(this._ssaoTarget, camera);
            this.renderPostProcessStep('ssao-blur-combine', this._renderTarget, this._ssaoBlurCombineScene);
          } else {
            this.renderComposition(camera, this._renderTarget);
          }
          break;

        default:
          throw new Error(`Unsupported anti-aliasing mode: ${this.antiAliasingMode}`);
      }
    } finally {
      // Restore state
      renderStateHelper.resetState();
      // renderer.setRenderTarget(original.renderTarget);
      this._materialManager.setRenderMode(original.renderMode);
      this.restoreCadNodes();

      if (this._debugRenderTimings) {
        log.debug('=============== RENDER END ===============');
      }
    }
  }

  private restoreCadNodes() {
    this._rootSectorNodeBuffer.forEach(p => {
      p[1].add(p[0]);
    });
    this._rootSectorNodeBuffer.clear();
  }

  private extractCadNodes(scene: THREE.Scene) {
    this._rootSectorNodeBuffer.forEach(p => {
      if (p[1].parent !== scene && p[1].parent !== null && p[1].parent.parent !== scene) {
        throw new Error('CadNode must be put at scene root');
      }
      this._cadScene.add(p[0]);
    });
  }

  public setRenderTarget(target: THREE.WebGLRenderTarget | null): void {
    this._renderTarget = target;
  }

  public getRenderTarget(): THREE.WebGLRenderTarget | null {
    return this._renderTarget;
  }

  public setRenderTargetAutoSize(autoSize: boolean): void {
    this._autoSetTargetSize = autoSize;
  }

  public getRenderTargetAutoSize(): boolean {
    return this._autoSetTargetSize;
  }

  private clearTarget(target: THREE.WebGLRenderTarget | null) {
    this._renderer.setRenderTarget(target);
    this._renderer.clear();
  }

  private explicitFlushRender(camera: THREE.Camera, target: THREE.WebGLRenderTarget | null) {
    this._renderer.setRenderTarget(target);
    this.renderStep('flushRender', this._emptyScene, camera);
  }

  private splitToScenes(): { hasBackElements: boolean; hasInFrontElements: boolean; hasGhostElements: boolean } {
    const result = { hasBackElements: false, hasInFrontElements: false, hasGhostElements: false };

    // Determine what rendering stages will be active
    this._rootSectorNodeBuffer.forEach(rootSectorNodeData => {
      const cadNode: CadNode = rootSectorNodeData[1];

      const backSet = this._materialManager.getModelBackTreeIndices(cadNode.cadModelMetadata.modelIdentifier);
      const infrontSet = this._materialManager.getModelInFrontTreeIndices(cadNode.cadModelMetadata.modelIdentifier);
      const ghostSet = this._materialManager.getModelGhostedTreeIndices(cadNode.cadModelMetadata.modelIdentifier);
      const hasBackElements = backSet.count > 0;
      const hasInFrontElements = infrontSet.count > 0;
      const hasGhostElements = ghostSet.count > 0;
      result.hasBackElements = result.hasBackElements || hasBackElements;
      result.hasInFrontElements = result.hasInFrontElements || hasInFrontElements;
      result.hasGhostElements = result.hasGhostElements || hasGhostElements;
    });

    // Split scenes based on what render stages we need
    const { hasBackElements, hasInFrontElements, hasGhostElements } = result;
    this._rootSectorNodeBuffer.forEach(rootSectorNodeData => {
      const root: RootSectorNode = rootSectorNodeData[0];
      const cadNode: CadNode = rootSectorNodeData[1];

      const backSet = this._materialManager.getModelBackTreeIndices(cadNode.cadModelMetadata.modelIdentifier);
      const infrontSet = this._materialManager.getModelInFrontTreeIndices(cadNode.cadModelMetadata.modelIdentifier);

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
        const objectTreeIndices = element.userData.treeIndices as Map<number, number> | undefined;

        if (objectTreeIndices) {
          if (hasInFrontElements && infrontSet.hasIntersectionWith(objectTreeIndices)) {
            this._inFrontSceneBuilder.addElement(element, infrontRoot);
          }
          // Note! When we don't have any ghost, we use _cadScene to hold back objects, so no action required
          if (hasBackElements && !hasGhostElements) {
          } else if (hasGhostElements && backSet.hasIntersectionWith(objectTreeIndices)) {
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

  private renderNormalCadModels(
    camera: THREE.PerspectiveCamera,
    target: THREE.WebGLRenderTarget | null = this._normalRenderedCadModelTarget
  ) {
    this._normalSceneBuilder.populateTemporaryScene();
    this._renderer.setRenderTarget(target);
    this.renderStep('normal', this._normalScene, camera);
  }

  private renderNormalCadModelsFromBaseScene(
    camera: THREE.PerspectiveCamera,
    target: THREE.WebGLRenderTarget | null = this._normalRenderedCadModelTarget
  ) {
    this._renderer.setRenderTarget(target);
    this.renderStep('normalCadModelsFromBaseScene', this._cadScene, camera);
  }

  private renderInFrontCadModels(
    camera: THREE.PerspectiveCamera,
    target: THREE.WebGLRenderTarget | null = this._inFrontRenderedCadModelTarget
  ) {
    this._inFrontSceneBuilder.populateTemporaryScene();
    this._renderer.setRenderTarget(target);
    this._materialManager.setRenderMode(RenderMode.Effects);
    this.renderStep('infront', this._inFrontScene, camera);
  }

  private renderGhostedCadModelsFromBaseScene(camera: THREE.PerspectiveCamera) {
    this._renderer.setRenderTarget(this._ghostObjectRenderTarget);
    this._materialManager.setRenderMode(RenderMode.Ghost);
    this.renderStep('ghosted', this._cadScene, camera);
  }

  private renderCustomObjects(scene: THREE.Scene, camera: THREE.PerspectiveCamera) {
    const originalAutoUpdate = scene.autoUpdate;
    try {
      scene.autoUpdate = true;
      this._renderer.setRenderTarget(this._customObjectRenderTarget);
      this.renderStep('customobjects', scene, camera);
    } finally {
      scene.autoUpdate = originalAutoUpdate;
    }
  }

  private updateRenderSize(renderer: THREE.WebGLRenderer) {
    const renderSize = new THREE.Vector2();
    renderer.getSize(renderSize);

    if (
      this._renderTarget &&
      this._autoSetTargetSize &&
      renderSize.x !== this._renderTarget.width &&
      renderSize.y !== this._renderTarget.height
    ) {
      this._renderTarget.setSize(renderSize.x, renderSize.y);
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
      this._ssaoBlurCombineTarget.setSize(renderSize.x, renderSize.y);

      this._combineOutlineDetectionMaterial.uniforms.texelSize.value = new THREE.Vector2(
        this._outlineTexelSize / renderSize.x,
        this._outlineTexelSize / renderSize.y
      );

      this._combineOutlineDetectionMaterial.uniforms.resolution.value = renderSize;

      this._ssaoMaterial.uniforms.resolution.value = renderSize;

      this._ssaoBlurCombineMaterial.uniforms.resolution.value = renderSize;

      this._fxaaMaterial.uniforms.resolution.value = renderSize;
      this._fxaaMaterial.uniforms.inverseResolution.value = new THREE.Vector2(1.0 / renderSize.x, 1.0 / renderSize.y);
    }
    return renderSize;
  }

  private renderComposition(camera: THREE.PerspectiveCamera, target: THREE.WebGLRenderTarget | null) {
    this._combineOutlineDetectionMaterial.uniforms.cameraNear.value = camera.near;
    this._combineOutlineDetectionMaterial.uniforms.cameraFar.value = camera.far;

    this.renderPostProcessStep('composition', target, this._compositionScene);
  }

  private setSsaoParameters(params: SsaoParameters) {
    const defaultSsaoParameters = defaultRenderOptions.ssaoRenderParameters;

    this._ssaoMaterial.uniforms.sampleRadius.value = params.sampleRadius;
    this._ssaoMaterial.uniforms.bias.value = params.depthCheckBias;

    if (params.sampleSize !== this.ssaoParameters(this._renderOptions).sampleSize) {
      const sampleSize = params?.sampleSize ?? defaultSsaoParameters.sampleSize!;

      const kernel = this.createKernel(sampleSize);

      this._fxaaMaterial.uniforms.tDiffuse.value =
        params.sampleSize !== SsaoSampleQuality.None
          ? this._ssaoBlurCombineTarget.texture
          : this._compositionTarget.texture;

      this._ssaoMaterial.uniforms.kernel.value = kernel;

      this._ssaoMaterial.defines = {
        MAX_KERNEL_SIZE: sampleSize
      };

      this._ssaoMaterial.needsUpdate = true;
    }
  }

  private renderPostProcessStep(renderStage: string, target: THREE.WebGLRenderTarget | null, scene: THREE.Scene) {
    const renderer = this._renderer;
    renderer.setRenderTarget(target);

    this.renderStep(renderStage, scene, this._orthographicCamera);

    if (target === this._renderTarget) {
      const renderSize = renderer.getSize(new THREE.Vector2());
      const canvasSize = new THREE.Vector2(renderer.domElement.clientWidth, renderer.domElement.clientHeight);

      const downSampleFactor = new THREE.Vector2(renderSize.x / canvasSize.x, renderSize.y / canvasSize.y);

      renderer.autoClear = false;
      this._uiObjects.forEach(uiObject => {
        const renderScene = new THREE.Scene();
        renderScene.add(uiObject.object);

        const viewportRenderPos = uiObject.screenPos.clone().multiply(downSampleFactor);
        const viewportRenderWidth = uiObject.width * downSampleFactor.x;
        const viewportRenderHeight = uiObject.height * downSampleFactor.y;

        renderer.setViewport(viewportRenderPos.x, viewportRenderPos.y, viewportRenderWidth, viewportRenderHeight);
        renderer.clearDepth();
        renderer.render(renderScene, this._orthographicCamera);
      });

      renderer.setViewport(0, 0, renderSize.x, renderSize.y);
      renderer.autoClear = true;
    }
  }

  private renderSsao(target: THREE.WebGLRenderTarget | null, camera: THREE.Camera) {
    this._ssaoMaterial.uniforms.inverseProjectionMatrix.value = camera.projectionMatrixInverse;
    this._ssaoMaterial.uniforms.projMatrix.value = camera.projectionMatrix;

    this.renderPostProcessStep('ssao', target, this._ssaoScene);
  }

  private renderStep(renderStage: string, scene: THREE.Scene, camera: THREE.Camera) {
    if (!this._debugRenderTimings) {
      this._renderer.render(scene, camera);
      return;
    }

    this.deepFlushRenderer();
    const now = performance.now();
    this._renderer.render(scene, camera);
    this.deepFlushRenderer();

    log.log(`Render stage '${renderStage}' took ${performance.now() - now} ms`);
  }

  private readonly _deepFlushRendererArgs = {
    buffer: new ArrayBuffer(4)
  };

  private deepFlushRenderer() {
    const { buffer } = this._deepFlushRendererArgs;

    const context = this._renderer.getContext();
    const renderTarget = this._renderer.getRenderTarget();
    // Note! Not sure why, but flush/finish doesn't block
    // and we therefore use renderTargetPixels() which
    // ensures the GPU pipeline is flushed
    context.flush();
    context.finish();
    if (renderTarget !== null) {
      this._renderer.readRenderTargetPixels(renderTarget, 0, 0, 1, 1, buffer);
    }
  }

  private createOutlineColorTexture(): THREE.DataTexture {
    const outlineColorBuffer = new Uint8Array(8 * 4);
    const outlineColorTexture = new THREE.DataTexture(outlineColorBuffer, 8, 1);
    setOutlineColor(outlineColorTexture.image.data, NodeOutlineColor.White, CogniteColors.White);
    setOutlineColor(outlineColorTexture.image.data, NodeOutlineColor.Black, CogniteColors.Black);
    setOutlineColor(outlineColorTexture.image.data, NodeOutlineColor.Cyan, CogniteColors.Cyan);
    setOutlineColor(outlineColorTexture.image.data, NodeOutlineColor.Blue, CogniteColors.Blue);
    setOutlineColor(outlineColorTexture.image.data, NodeOutlineColor.Green, RevealColors.Green);
    setOutlineColor(outlineColorTexture.image.data, NodeOutlineColor.Red, RevealColors.Red);
    setOutlineColor(outlineColorTexture.image.data, NodeOutlineColor.Orange, CogniteColors.Orange);
    outlineColorTexture.needsUpdate = true;
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

    const ssaoBlurCombineMesh = new THREE.Mesh(geometry, this._ssaoBlurCombineMaterial);
    this._ssaoBlurCombineScene.add(ssaoBlurCombineMesh);
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
    const geometry = new THREE.BufferGeometry();
    const vertices = new Float32Array([-1, -1, 0, 3, -1, 0, -1, 3, 0]);
    const uvs = new Float32Array([0, 0, 2, 0, 0, 2]);

    geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));

    return geometry;
  }

  private traverseForRootSectorNode(root: THREE.Object3D) {
    const objectStack = [root];

    while (objectStack.length > 0) {
      const element = objectStack.pop()!;
      if (element instanceof RootSectorNode) {
        const cadNode = element.parent! as CadNode;
        if (cadNode.visible) {
          this._rootSectorNodeBuffer.add([element, cadNode]);
        }
      } else if (!(element instanceof THREE.Group)) {
        objectStack.push(...element.children);
      }
    }
  }

  private setVisibilityOfSectors(levelOfDetail: LevelOfDetail, visible: boolean) {
    this._originalScene.traverse(x => {
      if (x instanceof SectorNode && x.levelOfDetail === levelOfDetail) {
        x.visible = visible;
      }
    });
  }

  /**
   * Assign SpectorJS metadata containing names for the render targets when running Reveal
   * in development mode.
   */
  private setupRenderTargetSpectorDebugging() {
    if (process.env.IS_DEVELOPMENT_MODE) {
      this.assignSpectorJsMetadataToRenderTarget(this._inFrontRenderedCadModelTarget, {
        name: 'inFrontRenderedCadModelTarget'
      });
      this.assignSpectorJsMetadataToRenderTarget(this._normalRenderedCadModelTarget, {
        name: 'normalRenderedCadModelTarget'
      });
      this.assignSpectorJsMetadataToRenderTarget(this._ghostObjectRenderTarget, {
        name: 'ghostObjectRenderTarget'
      });
      this.assignSpectorJsMetadataToRenderTarget(this._customObjectRenderTarget, {
        name: 'customObjectRenderTarget'
      });
      this.assignSpectorJsMetadataToRenderTarget(this._compositionTarget, {
        name: 'compositionTarget'
      });
      this.assignSpectorJsMetadataToRenderTarget(this._ssaoTarget, {
        name: 'ssaoTarget'
      });
      this.assignSpectorJsMetadataToRenderTarget(this._ssaoBlurCombineTarget, {
        name: 'ssaoBlurCombineTarget'
      });
    }
  }

  /**
   * Assigns SpectorJS metadata to the current framebuffer (render target).
   * This is useful to assign e.g. names to framebuffers to easy debugging in SpectorJS. The metadata
   * will be visible in 'bindFramebuffer'-commands in the SpectorJS report.
   */
  private assignSpectorJsMetadataToRenderTarget(renderTarget: THREE.WebGLRenderTarget, metadata: any) {
    const currentRenderTarget = this._renderer.getRenderTarget();
    try {
      this._renderer.setRenderTarget(renderTarget);
      const gl = this._renderer.getContext();
      const framebuffer = gl.getParameter(gl.FRAMEBUFFER_BINDING);
      framebuffer.__SPECTOR_Metadata = metadata;
    } finally {
      this._renderer.setRenderTarget(currentRenderTarget);
    }
  }
}

function createRenderTarget(
  multiSampleCountHint: number,
  options?: THREE.WebGLRenderTargetOptions
): THREE.WebGLRenderTarget {
  if (multiSampleCountHint > 1) {
    const rt = new THREE.WebGLRenderTarget(1, 1, {
      ...options,
      sample: multiSampleCountHint
    } as any);
    return rt;
  }
  return new THREE.WebGLRenderTarget(1, 1, options);
}

function setOutlineColor(outlineTextureData: Uint8ClampedArray, colorIndex: number, color: THREE.Color) {
  outlineTextureData[4 * colorIndex + 0] = Math.floor(255 * color.r);
  outlineTextureData[4 * colorIndex + 1] = Math.floor(255 * color.g);
  outlineTextureData[4 * colorIndex + 2] = Math.floor(255 * color.b);
  outlineTextureData[4 * colorIndex + 3] = 255;
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
