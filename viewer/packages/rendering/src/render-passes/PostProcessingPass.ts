/*!
 * Copyright 2022 Cognite AS
 */

import type { Camera, DepthTexture, Material, Mesh, Scene, ShaderMaterial, WebGLRenderer } from 'three';
import { GLSL3, Matrix4, Plane, RawShaderMaterial, Vector3, Vector4 } from 'three';
import type { PostProcessingObjectsVisibilityParameters } from './types';
import { transparentBlendOptions } from './types';
import type { RenderPass } from '../RenderPass';
import {
  createFullScreenTriangleMesh,
  getBlitMaterial,
  getDepthBlendBlitMaterial,
  getLayerMask,
  getPointCloudPostProcessingMaterial,
  RenderLayer
} from '../utilities/renderUtilities';
import type { PostProcessingPipelineOptions } from '../render-pipeline-providers/types';
import { shouldApplyEdl } from '../render-pipeline-providers/pointCloudParameterUtils';
import { cadLightDirectionView } from '../rendering/cadLighting';
import { shadowReceiverShaders } from '../rendering/shaders';

/**
 * Single pass that applies post processing effects and
 * combines results from geometry passes.
 * This is done by intentionally layering full screen-space
 * triangles in a specific render order.
 */
export class PostProcessingPass implements RenderPass {
  private readonly _scene: Scene;
  private readonly _postProcessingObjects: Mesh[];
  private readonly _pointcloudBlitMaterial: ShaderMaterial;
  private readonly _backBlitMaterial: RawShaderMaterial;
  private readonly _shadowReceiverMaterial: RawShaderMaterial;
  private readonly _postProcessingOptions: PostProcessingPipelineOptions;
  private readonly _cadLightView = new Vector3();
  private readonly _shadowGroundPoint = new Vector3();
  private readonly _shadowGroundNormal = new Vector3(0, 1, 0);
  private readonly _shadowWorldPlane = new Plane();
  private _shadowGroundY = 0;
  private readonly setBlendFactorByBackVisibility: () => void;

  public updateRenderObjectsVisibility(visibilityParameters: PostProcessingObjectsVisibilityParameters): void {
    this._postProcessingObjects[0].visible = visibilityParameters.cad.back;
    this._postProcessingObjects[1].visible = visibilityParameters.cad.ghost;
    this._postProcessingObjects[2].visible = visibilityParameters.cad.inFront;
    this._postProcessingObjects[3].visible = visibilityParameters.pointCloud;

    this.setBlendFactorByBackVisibility();
  }

  constructor(
    scene: Scene,
    postProcessingPipelineOptions: PostProcessingPipelineOptions,
    shadowReceiverDepth: DepthTexture
  ) {
    this._scene = scene;
    this._postProcessingOptions = postProcessingPipelineOptions;

    const backBlitMaterial = getBlitMaterial({
      texture: postProcessingPipelineOptions.back.texture,
      depthTexture: postProcessingPipelineOptions.back.depthTexture,
      ssaoTexture: postProcessingPipelineOptions.ssaoTexture,
      overrideAlpha: 1.0,
      edges: postProcessingPipelineOptions.edges,
      outline: true,
      contactShadow: true
    });
    this._backBlitMaterial = backBlitMaterial;

    // Normal un-styled opaque geometry
    const backBlitObject = createFullScreenTriangleMesh(backBlitMaterial);
    backBlitObject.name = 'Back Styling blit object';
    backBlitObject.renderOrder = -1;

    const pointcloudBlitMaterial = getPointCloudPostProcessingMaterial({
      logDepthTexture: postProcessingPipelineOptions.pointCloudLogDepth.texture,
      texture: postProcessingPipelineOptions.pointCloud.texture,
      depthTexture: postProcessingPipelineOptions.pointCloud.depthTexture,
      pointBlending: postProcessingPipelineOptions?.pointBlending ?? false,
      edlOptions: postProcessingPipelineOptions.edlOptions
    });

    this._pointcloudBlitMaterial = pointcloudBlitMaterial;

    // rendered pointcloud data
    const pointcloudBlitObject = createFullScreenTriangleMesh(pointcloudBlitMaterial);
    pointcloudBlitObject.name = 'Point Cloud blit object';
    pointcloudBlitObject.renderOrder = 0;

    const ghostBlitMaterial = getBlitMaterial({
      texture: postProcessingPipelineOptions.ghost.texture,
      depthTexture: postProcessingPipelineOptions.ghost.depthTexture,
      blendOptions: transparentBlendOptions
    });

    // Ghosted geometry
    const ghostBlitObject = createFullScreenTriangleMesh(ghostBlitMaterial);
    ghostBlitObject.name = 'Ghost Styling blit object';
    ghostBlitObject.renderOrder = 1;

    const inFrontBlitMaterial = getDepthBlendBlitMaterial({
      texture: postProcessingPipelineOptions.inFront.texture,
      depthTexture: postProcessingPipelineOptions.inFront.depthTexture,
      blendTexture: postProcessingPipelineOptions.back.texture,
      blendDepthTexture: postProcessingPipelineOptions.back.depthTexture,
      blendFactor: 0.5,
      overrideAlpha: 1.0,
      outline: true
    });

    //In front geometry
    const inFrontBlitObject = createFullScreenTriangleMesh(inFrontBlitMaterial);
    inFrontBlitObject.name = 'In-front Styling blit object';
    inFrontBlitObject.renderOrder = 2;

    // Removes blending with the back objects framebuffer when it is hidden i.e. not
    // been rendered. This is a sanity check as well as a workaround for multisampled
    // rendertargets not being able to clear properly (REV-530).
    this.setBlendFactorByBackVisibility = () => {
      inFrontBlitMaterial.uniforms.blendFactor.value = backBlitObject.visible ? 0.5 : 0.0;
    };

    this._scene.add(backBlitObject);
    this._scene.add(pointcloudBlitObject);
    this._scene.add(ghostBlitObject);
    this._scene.add(inFrontBlitObject);

    this._postProcessingObjects = [backBlitObject, ghostBlitObject, inFrontBlitObject, pointcloudBlitObject];

    this._shadowReceiverMaterial = new RawShaderMaterial({
      vertexShader: shadowReceiverShaders.vertex,
      fragmentShader: shadowReceiverShaders.fragment,
      glslVersion: GLSL3,
      transparent: true,
      // Receiver materials may use polygon offset, so compare depth explicitly
      // in the shader instead of depth-testing against the final target.
      depthTest: false,
      depthWrite: false,
      uniforms: {
        tCadDepth: { value: postProcessingPipelineOptions.back.depthTexture },
        tReceiverDepth: { value: shadowReceiverDepth },
        inverseProjectionMatrix: { value: new Matrix4() },
        cadLightDirection: { value: new Vector3() },
        cadShadowPlane: { value: new Vector4() }
      }
    });
    const shadowObject = createFullScreenTriangleMesh(this._shadowReceiverMaterial);
    shadowObject.name = 'CAD shadow receiver overlay';
    shadowObject.renderOrder = 0.5;
    this._scene.add(shadowObject);
    this._postProcessingObjects.push(shadowObject);
  }

  public setShadowGroundY(y: number): void {
    this._shadowGroundY = y;
  }

  public render(renderer: WebGLRenderer, camera: Camera): void {
    if (shouldApplyEdl(this._postProcessingOptions.edlOptions)) {
      this._pointcloudBlitMaterial.uniforms.screenWidth = { value: this._postProcessingOptions.pointCloud.width };
      this._pointcloudBlitMaterial.uniforms.screenHeight = { value: this._postProcessingOptions.pointCloud.height };
    }

    const contactLight = this._backBlitMaterial.uniforms.cadLightDirection;
    const inverseProjection = this._backBlitMaterial.uniforms.inverseProjectionMatrix;
    const shadowPlane = this._backBlitMaterial.uniforms.cadShadowPlane;
    if (contactLight !== undefined && inverseProjection !== undefined && shadowPlane !== undefined) {
      contactLight.value.copy(cadLightDirectionView(camera, this._cadLightView));
      inverseProjection.value.copy(camera.projectionMatrixInverse);

      this._shadowGroundPoint.set(0, this._shadowGroundY, 0);
      this._shadowWorldPlane.setFromNormalAndCoplanarPoint(this._shadowGroundNormal, this._shadowGroundPoint);
      this._shadowWorldPlane.applyMatrix4(camera.matrixWorldInverse);
      (shadowPlane.value as Vector4).set(
        this._shadowWorldPlane.normal.x,
        this._shadowWorldPlane.normal.y,
        this._shadowWorldPlane.normal.z,
        this._shadowWorldPlane.constant
      );

      this._shadowReceiverMaterial.uniforms.cadLightDirection.value.copy(contactLight.value);
      this._shadowReceiverMaterial.uniforms.inverseProjectionMatrix.value.copy(camera.projectionMatrixInverse);
      this._shadowReceiverMaterial.uniforms.cadShadowPlane.value.copy(shadowPlane.value);
    }

    renderer.sortObjects = true;
    camera.layers.mask = getLayerMask(RenderLayer.Default);
    renderer.render(this._scene, camera);
  }

  public dispose(): void {
    this._postProcessingObjects.forEach(postProcessingObject => {
      postProcessingObject.geometry.dispose();
      (postProcessingObject.material as Material).dispose();
      this._scene.remove(postProcessingObject);
    });
  }
}
