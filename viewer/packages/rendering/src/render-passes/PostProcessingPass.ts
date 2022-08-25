/*!
 * Copyright 2022 Cognite AS
 */

import * as THREE from 'three';
import { transparentBlendOptions } from './types';
import { RenderPass } from '../RenderPass';
import {
  createFullScreenTriangleMesh,
  getBlitMaterial,
  getDepthBlendBlitMaterial,
  getLayerMask,
  RenderLayer
} from '../utilities/renderUtilities';
import { PostProcessingPipelineOptions } from '../render-pipeline-providers/types';
import { pointCloudShaders } from '../rendering/shaders';

/**
 * Single pass that applies post processing effects and
 * combines results from geometry passes.
 * This is done by intentionally layering full screen-space
 * triangles in a specific render order.
 */
export class PostProcessingPass implements RenderPass {
  private readonly _scene: THREE.Scene;
  private readonly _postProcessingObjects: THREE.Mesh[];

  public updateRenderObjectsVisability(hasStyling: { back: boolean; inFront: boolean; ghost: boolean }): void {
    this._postProcessingObjects[0].visible = hasStyling.back;
    this._postProcessingObjects[1].visible = hasStyling.ghost;
    this._postProcessingObjects[2].visible = hasStyling.inFront;
  }

  constructor(scene: THREE.Scene, postProcessingPipelineOptions: PostProcessingPipelineOptions) {
    this._scene = scene;

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
    backBlitObject.name = 'Back Styling';
    backBlitObject.renderOrder = -1;

    const pointcloudBlitMaterial = new THREE.RawShaderMaterial({
      vertexShader: pointCloudShaders.normalize.vertex,
      fragmentShader: pointCloudShaders.normalize.fragment,
      uniforms: {
        tDiffuse: { value: postProcessingPipelineOptions.pointCloud.texture },
        tDepth: { value: postProcessingPipelineOptions.pointCloud.depthTexture }
      },
      defines: postProcessingPipelineOptions?.pointBlending
        ? {
            points_blend: ''
          }
        : {},
      glslVersion: THREE.GLSL3,
      depthTest: true,
      depthWrite: true,
      transparent: true
    });
    // rendered pointcloud data
    const pointcloudBlitObject = createFullScreenTriangleMesh(pointcloudBlitMaterial);
    backBlitObject.name = 'Pointcloud';
    backBlitObject.renderOrder = 0;

    const ghostBlitMaterial = getBlitMaterial({
      texture: postProcessingPipelineOptions.ghost.texture,
      depthTexture: postProcessingPipelineOptions.ghost.depthTexture,
      blendOptions: transparentBlendOptions
    });

    // Ghosted geometry
    const ghostBlitObject = createFullScreenTriangleMesh(ghostBlitMaterial);
    ghostBlitObject.name = 'Ghost Styling';
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
    inFrontBlitObject.name = 'In-front Styling';
    inFrontBlitObject.renderOrder = 2;

    this._scene.add(backBlitObject);
    this._scene.add(pointcloudBlitObject);
    this._scene.add(ghostBlitObject);
    this._scene.add(inFrontBlitObject);

    this._postProcessingObjects = [backBlitObject, ghostBlitObject, inFrontBlitObject, pointcloudBlitObject];
  }

  public render(renderer: THREE.WebGLRenderer, camera: THREE.Camera): void {
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
