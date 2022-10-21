/*!
 * Copyright 2022 Cognite AS
 */

import * as THREE from 'three';
import { PostProcessingObjectsVisibilityParameters, transparentBlendOptions } from './types';
import { RenderPass } from '../RenderPass';
import {
  createFullScreenTriangleMesh,
  getBlitMaterial,
  getDepthBlendBlitMaterial,
  getLayerMask,
  getPointCloudPostProcessingMaterial,
  RenderLayer
} from '../utilities/renderUtilities';
import { PostProcessingPipelineOptions } from '../render-pipeline-providers/types';

/**
 * Single pass that applies post processing effects and
 * combines results from geometry passes.
 * This is done by intentionally layering full screen-space
 * triangles in a specific render order.
 */
export class PostProcessingPass implements RenderPass {
  private readonly _scene: THREE.Scene;
  private readonly _postProcessingObjects: THREE.Mesh[];
  private readonly _pointcloudBlitMaterial: THREE.ShaderMaterial;
  private readonly _postProcessingOptions: PostProcessingPipelineOptions;
  private readonly setBlendFactorByBackVisibility: () => void;

  public updateRenderObjectsVisibility(visibilityParameters: PostProcessingObjectsVisibilityParameters): void {
    this._postProcessingObjects[0].visible = visibilityParameters.cad.back;
    this._postProcessingObjects[1].visible = visibilityParameters.cad.ghost;
    this._postProcessingObjects[2].visible = visibilityParameters.cad.inFront;
    this._postProcessingObjects[3].visible = visibilityParameters.pointCloud;

    this.setBlendFactorByBackVisibility();
  }

  constructor(scene: THREE.Scene, postProcessingPipelineOptions: PostProcessingPipelineOptions) {
    this._scene = scene;
    this._postProcessingOptions = postProcessingPipelineOptions;

    const backBlitMaterial = getBlitMaterial({
      texture: postProcessingPipelineOptions.back.texture,
      depthTexture: postProcessingPipelineOptions.back.depthTexture,
      ssaoTexture: postProcessingPipelineOptions.ssaoTexture,
      overrideAlpha: 1.0,
      edges: postProcessingPipelineOptions.edges,
      outline: true
    });

    // Normal un-styled opaque geometry
    const backBlitObject = createFullScreenTriangleMesh(backBlitMaterial);
    backBlitObject.name = 'Back Styling blit object';
    backBlitObject.renderOrder = -1;

    const pointcloudBlitMaterial = getPointCloudPostProcessingMaterial({
      texture: postProcessingPipelineOptions.pointCloud.texture,
      depthTexture: postProcessingPipelineOptions.pointCloud.depthTexture,
      pointBlending: postProcessingPipelineOptions?.pointBlending ?? false,
      EDLOptions: postProcessingPipelineOptions?.EDLOptions
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
  }

  public render(renderer: THREE.WebGLRenderer, camera: THREE.Camera): void {
    if (this._postProcessingOptions.EDLOptions) {
      this._pointcloudBlitMaterial.uniforms.screenWidth = { value: this._postProcessingOptions.pointCloud.width };
      this._pointcloudBlitMaterial.uniforms.screenHeight = { value: this._postProcessingOptions.pointCloud.height };
    }

    renderer.sortObjects = true;
    camera.layers.mask = getLayerMask(RenderLayer.Default);
    renderer.render(this._scene, camera);
  }

  public dispose(): void {
    this._postProcessingObjects.forEach(postProcessingObject => {
      postProcessingObject.geometry.dispose();
      (postProcessingObject.material as THREE.Material).dispose();
      this._scene.remove(postProcessingObject);
    });
  }
}
