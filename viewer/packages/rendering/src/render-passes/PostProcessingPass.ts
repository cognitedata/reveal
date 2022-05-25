/*!
 * Copyright 2022 Cognite AS
 */

import * as THREE from 'three';
import { transparentBlendOptions } from './types';
import { RenderPass } from '../RenderPass';
import { createFullScreenTriangleMesh, getBlitMaterial, getLayerMask, RenderLayer } from '../utilities/renderUtilities';
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

  public updateRenderObjectsVisability(hasStyling: { back: boolean; inFront: boolean; ghost: boolean }): void {
    this._postProcessingObjects[0].visible = hasStyling.inFront;
    this._postProcessingObjects[1].visible = hasStyling.back;
    this._postProcessingObjects[2].visible = hasStyling.ghost;
    this._postProcessingObjects[3].visible = hasStyling.inFront;
  }

  constructor(scene: THREE.Scene, postProcessingPipelineOptions: PostProcessingPipelineOptions) {
    this._scene = scene;

    const inFrontEarlyZBlitMaterial = getBlitMaterial({
      texture: postProcessingPipelineOptions.inFront.texture,
      depthTexture: postProcessingPipelineOptions.inFront.depthTexture,
      overrideAlpha: 1.0,
      writeColor: false
    });

    // Fills the depth buffer with infront objects
    // to prevent infront objects to blend with other objects
    // that are behind
    const inFrontEarlyZBlitObject = createFullScreenTriangleMesh(inFrontEarlyZBlitMaterial);
    inFrontEarlyZBlitObject.name = 'Early In-front Z Pass';
    inFrontEarlyZBlitObject.renderOrder = -2;

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

    const ghostBlitMaterial = getBlitMaterial({
      texture: postProcessingPipelineOptions.ghost.texture,
      depthTexture: postProcessingPipelineOptions.ghost.depthTexture,
      blendOptions: transparentBlendOptions
    });

    // Ghosted geometry
    const ghostBlitObject = createFullScreenTriangleMesh(ghostBlitMaterial);
    ghostBlitObject.name = 'Ghost Styling';
    ghostBlitObject.renderOrder = 1;

    const inFrontBlitMaterial = getBlitMaterial({
      texture: postProcessingPipelineOptions.inFront.texture,
      blendOptions: transparentBlendOptions,
      overrideAlpha: 0.5,
      outline: true
    });

    //In front geometry
    const inFrontBlitObject = createFullScreenTriangleMesh(inFrontBlitMaterial);
    inFrontBlitObject.name = 'In-front Styling';
    inFrontBlitObject.renderOrder = 2;

    this._scene.add(inFrontEarlyZBlitObject);
    this._scene.add(backBlitObject);
    this._scene.add(ghostBlitObject);
    this._scene.add(inFrontBlitObject);

    this._postProcessingObjects = [inFrontEarlyZBlitObject, backBlitObject, ghostBlitObject, inFrontBlitObject];
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
