/*!
 * Copyright 2026 Cognite AS
 */
import type { WebGLRenderer } from 'three';
import { OrthographicCamera, PerspectiveCamera, Scene, Texture, WebGLRenderTarget } from 'three';
import { PostProcessingPass } from './PostProcessingPass';
import type { PostProcessingPipelineOptions } from '../render-pipeline-providers/types';

const POINT_CLOUD_WIDTH = 640;
const POINT_CLOUD_HEIGHT = 480;

function createOptions(): PostProcessingPipelineOptions {
  const pointCloud = new WebGLRenderTarget(POINT_CLOUD_WIDTH, POINT_CLOUD_HEIGHT);
  return {
    currentRenderSize: { x: 1, y: 1 } as any,
    back: new WebGLRenderTarget(1, 1),
    ghost: new WebGLRenderTarget(1, 1),
    inFront: new WebGLRenderTarget(1, 1),
    pointCloudLogDepth: new WebGLRenderTarget(1, 1),
    pointCloud,
    ssaoTexture: new Texture(),
    edges: false,
    pointBlending: false,
    edlOptions: { strength: 0, radius: 0 }
  };
}

function createRenderer(): WebGLRenderer {
  return {
    sortObjects: false,
    render: () => {}
  } as unknown as WebGLRenderer;
}

describe(PostProcessingPass.name, () => {
  test('feeds the current point cloud render-target size into the blit material every render', () => {
    const options = createOptions();
    const pass = new PostProcessingPass(new Scene(), options);
    const renderer = createRenderer();
    const camera = new PerspectiveCamera();

    pass.render(renderer, camera);

    const uniforms = (pass as any)._pointcloudBlitMaterial.uniforms;
    expect(uniforms.screenWidth.value).toBe(POINT_CLOUD_WIDTH);
    expect(uniforms.screenHeight.value).toBe(POINT_CLOUD_HEIGHT);
  });

  test('derives world-per-pixel gap-fill gating from the perspective camera near/far/fov', () => {
    const options = createOptions();
    const pass = new PostProcessingPass(new Scene(), options);
    const renderer = createRenderer();
    const camera = new PerspectiveCamera(50, 1, 0.5, 2000);

    pass.render(renderer, camera);

    const uniforms = (pass as any)._pointcloudBlitMaterial.uniforms;
    expect(uniforms.cameraNear.value).toBe(0.5);
    expect(uniforms.cameraFar.value).toBe(2000);

    const expectedWorldPerPixelUnitDepth =
      (2 * Math.tan((camera.fov * Math.PI) / 360)) / Math.max(1, POINT_CLOUD_HEIGHT);
    expect(uniforms.worldPerPixelUnitDepth.value).toBeCloseTo(expectedWorldPerPixelUnitDepth);
    expect(uniforms.worldPerPixelUnitDepth.value).toBeGreaterThan(0);
  });

  test('disables the gap-fill distance gate for an orthographic camera', () => {
    const options = createOptions();
    const pass = new PostProcessingPass(new Scene(), options);
    const renderer = createRenderer();
    const camera = new OrthographicCamera();

    pass.render(renderer, camera);

    const uniforms = (pass as any)._pointcloudBlitMaterial.uniforms;
    expect(uniforms.worldPerPixelUnitDepth.value).toBe(0);
  });
});
