/*!
 * Copyright 2022 Cognite AS
 */

import * as THREE from 'three';
import { transparentBlendOptions } from './types';
import { RenderPass } from '../RenderPass';
import { createFullScreenTriangleMesh, getBlitMaterial, getLayerMask, RenderLayer } from '../utilities/renderUtilities';
import { PostProcessingPipelineOptions } from '../render-pipelines/types';

export class PostProcessingPass implements RenderPass {
  private readonly _scene: THREE.Scene;
  private readonly _customObjects: THREE.Object3D[];
  private readonly _postProcessingObjects: THREE.Mesh[];

  constructor(
    customObjects: THREE.Object3D[],
    scene: THREE.Scene,
    postProcessingPipelineOptions: PostProcessingPipelineOptions
  ) {
    this._scene = scene;
    this._customObjects = customObjects;

    const inFrontEarlyZBlitMaterial = getBlitMaterial({
      texture: postProcessingPipelineOptions.inFront.texture,
      depthTexture: postProcessingPipelineOptions.inFront.depthTexture,
      overrideAlpha: 1.0,
      writeColor: false
    });

    const inFrontEarlyZBlitObject = createFullScreenTriangleMesh(inFrontEarlyZBlitMaterial);
    inFrontEarlyZBlitObject.renderOrder = -2;

    const backBlitMaterial = getBlitMaterial({
      texture: postProcessingPipelineOptions.back.texture,
      depthTexture: postProcessingPipelineOptions.back.depthTexture,
      ssaoTexture: postProcessingPipelineOptions.ssaoTexture,
      overrideAlpha: 1.0,
      edges: postProcessingPipelineOptions.edges,
      outline: true
    });
    const backBlitObject = createFullScreenTriangleMesh(backBlitMaterial);
    backBlitObject.renderOrder = -1;

    const ghostBlitMaterial = getBlitMaterial({
      texture: postProcessingPipelineOptions.ghost.texture,
      depthTexture: postProcessingPipelineOptions.ghost.depthTexture,
      blendOptions: transparentBlendOptions
    });

    const ghostBlitObject = createFullScreenTriangleMesh(ghostBlitMaterial);
    ghostBlitObject.renderOrder = 1;

    const inFrontBlitMaterial = getBlitMaterial({
      texture: postProcessingPipelineOptions.inFront.texture,
      blendOptions: transparentBlendOptions,
      overrideAlpha: 0.5,
      outline: true
    });
    const inFrontBlitObject = createFullScreenTriangleMesh(inFrontBlitMaterial);
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
      this._scene.remove(postProcessingObject);
    });
  }
}
