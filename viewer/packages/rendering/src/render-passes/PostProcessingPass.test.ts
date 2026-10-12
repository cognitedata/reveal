/*!
 * Copyright 2026 Cognite AS
 */
import { It, Mock } from 'moq.ts';
import type { IUniform, WebGLRenderer } from 'three';
import {
  Mesh,
  OrthographicCamera,
  PerspectiveCamera,
  Scene,
  ShaderMaterial,
  Texture,
  Vector2,
  WebGLRenderTarget
} from 'three';
import { PostProcessingPass } from './PostProcessingPass';
import type { PostProcessingPipelineOptions } from '../render-pipeline-providers/types';

const POINT_CLOUD_WIDTH = 640;
const POINT_CLOUD_HEIGHT = 480;
const POINT_CLOUD_BLIT_OBJECT_NAME = 'Point Cloud blit object';

function createOptions(): PostProcessingPipelineOptions {
  return {
    currentRenderSize: new Vector2(1, 1),
    back: new WebGLRenderTarget(1, 1),
    ghost: new WebGLRenderTarget(1, 1),
    inFront: new WebGLRenderTarget(1, 1),
    pointCloudLogDepth: new WebGLRenderTarget(1, 1),
    pointCloud: new WebGLRenderTarget(POINT_CLOUD_WIDTH, POINT_CLOUD_HEIGHT),
    ssaoTexture: new Texture(),
    edges: false,
    pointBlending: false,
    edlOptions: { strength: 0, radius: 0 }
  };
}

function createRenderer(): WebGLRenderer {
  return new Mock<WebGLRenderer>()
    .setup(renderer => renderer.render(It.IsAny(), It.IsAny()))
    .returns(undefined)
    .object();
}

function getPointCloudBlitUniforms(scene: Scene): { [uniform: string]: IUniform } {
  const blitObject = scene.getObjectByName(POINT_CLOUD_BLIT_OBJECT_NAME);
  if (!(blitObject instanceof Mesh) || !(blitObject.material instanceof ShaderMaterial)) {
    throw new Error('Point cloud blit object with a shader material was not added to the scene');
  }
  return blitObject.material.uniforms;
}

describe(PostProcessingPass.name, () => {
  let scene: Scene;
  let pass: PostProcessingPass;

  beforeEach(() => {
    scene = new Scene();
    pass = new PostProcessingPass(scene, createOptions());
  });

  test('feeds the point cloud render-target size into the blit material on render', () => {
    pass.render(createRenderer(), new PerspectiveCamera());

    const uniforms = getPointCloudBlitUniforms(scene);
    expect(uniforms.screenWidth.value).toBe(POINT_CLOUD_WIDTH);
    expect(uniforms.screenHeight.value).toBe(POINT_CLOUD_HEIGHT);
  });

  test('derives the gap-fill distance gate from the perspective camera near, far and fov', () => {
    const camera = new PerspectiveCamera(50, 1, 0.5, 2000);

    pass.render(createRenderer(), camera);

    const uniforms = getPointCloudBlitUniforms(scene);
    const expectedWorldPerPixelUnitDepth = (2 * Math.tan((camera.fov * Math.PI) / 360)) / POINT_CLOUD_HEIGHT;
    expect(uniforms.cameraNear.value).toBe(0.5);
    expect(uniforms.cameraFar.value).toBe(2000);
    expect(uniforms.worldPerPixelUnitDepth.value).toBeCloseTo(expectedWorldPerPixelUnitDepth);
    expect(uniforms.worldPerPixelUnitDepth.value).toBeGreaterThan(0);
  });

  test('passes near and far but disables the gap-fill distance gate for an orthographic camera', () => {
    pass.render(createRenderer(), new OrthographicCamera(-1, 1, 1, -1, 0.5, 2000));

    const uniforms = getPointCloudBlitUniforms(scene);
    expect(uniforms.cameraNear.value).toBe(0.5);
    expect(uniforms.cameraFar.value).toBe(2000);
    expect(uniforms.worldPerPixelUnitDepth.value).toBe(0);
  });
});
