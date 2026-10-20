/*!
 * Copyright 2026 Cognite AS
 */
import { It, Mock } from 'moq.ts';
import type { IUniform, WebGLRenderer } from 'three';
import {
  Camera,
  DepthTexture,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  OrthographicCamera,
  PerspectiveCamera,
  PlaneGeometry,
  Scene,
  ShaderMaterial,
  Texture,
  Vector2,
  WebGLRenderTarget
} from 'three';
import type { ICustomObject } from '@reveal/utilities';
import { PostProcessingPass } from './PostProcessingPass';
import type { CadShadowMap, PostProcessingPipelineOptions } from '../render-pipeline-providers/types';
import { CadShadowPass } from './CadShadowPass';
import { CustomObjectEffectMaterial } from '../rendering/CustomObjectEffectMaterial';
import { autoMockWebGLRenderer } from '../../../../test-utilities';

const POINT_CLOUD_WIDTH = 640;
const POINT_CLOUD_HEIGHT = 480;
const POINT_CLOUD_BLIT_OBJECT_NAME = 'Point Cloud blit object';

function createOptions(cadShadow?: { map: CadShadowMap }): PostProcessingPipelineOptions {
  const back = new WebGLRenderTarget(1, 1);
  if (cadShadow !== undefined) {
    back.depthTexture = new DepthTexture(1, 1);
  }

  return {
    currentRenderSize: new Vector2(1, 1),
    back,
    ghost: new WebGLRenderTarget(1, 1),
    inFront: new WebGLRenderTarget(1, 1),
    pointCloudLogDepth: new WebGLRenderTarget(1, 1),
    pointCloud: new WebGLRenderTarget(POINT_CLOUD_WIDTH, POINT_CLOUD_HEIGHT),
    ssaoTexture: new Texture(),
    cadShadow,
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

function createShadowMap(enabled: boolean): CadShadowMap {
  return new Mock<CadShadowMap>()
    .setup(p => p.enabled)
    .returns(enabled)
    .setup(p => p.depthTexture)
    .returns(new DepthTexture(1, 1))
    .setup(p => p.matrix)
    .returns(new Matrix4())
    .setup(p => p.texelWorldSize)
    .returns(1)
    .setup(p => p.stableTexelWorldSize)
    .returns(1)
    .setup(p => p.depthRange)
    .returns(1)
    .object();
}

function createReceiverMaterial() {
  return new CustomObjectEffectMaterial('#88aa44');
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

  test('updates the existing uniform objects in place instead of replacing them', () => {
    const uniforms = getPointCloudBlitUniforms(scene);
    const uniformsBefore = { ...uniforms };

    pass.render(createRenderer(), new PerspectiveCamera());

    for (const name of ['screenWidth', 'screenHeight', 'cameraNear', 'cameraFar', 'worldPerPixel']) {
      expect(uniforms[name]).toBe(uniformsBefore[name]);
    }
  });

  test('derives the gap-fill distance gate from the perspective camera near, far, fov and zoom', () => {
    const camera = new PerspectiveCamera(50, 1, 0.5, 2000);
    camera.zoom = 2;

    pass.render(createRenderer(), camera);

    const uniforms = getPointCloudBlitUniforms(scene);
    const expectedWorldPerPixel = (2 * Math.tan((camera.fov * Math.PI) / 360)) / 2 / POINT_CLOUD_HEIGHT;
    expect(uniforms.cameraNear.value).toBe(0.5);
    expect(uniforms.cameraFar.value).toBe(2000);
    expect(uniforms.orthographicCamera.value).toBe(false);
    expect(uniforms.worldPerPixel.value).toBeCloseTo(expectedWorldPerPixel);
  });

  test('derives a constant world size per pixel for an orthographic camera', () => {
    const camera = new OrthographicCamera(-10, 10, 10, -10, 0.5, 2000);
    camera.zoom = 4;

    pass.render(createRenderer(), camera);

    const uniforms = getPointCloudBlitUniforms(scene);
    expect(uniforms.cameraNear.value).toBe(0.5);
    expect(uniforms.cameraFar.value).toBe(2000);
    expect(uniforms.orthographicCamera.value).toBe(true);
    expect(uniforms.worldPerPixel.value).toBeCloseTo(20 / 4 / POINT_CLOUD_HEIGHT);
  });

  test('disables the gap-fill distance gate when switching to an unknown camera type', () => {
    pass.render(createRenderer(), new OrthographicCamera(-1, 1, 1, -1, 0.5, 2000));
    pass.render(createRenderer(), new Camera());

    const uniforms = getPointCloudBlitUniforms(scene);
    expect(uniforms.orthographicCamera.value).toBe(false);
    expect(uniforms.worldPerPixel.value).toBe(0);
  });

  test.each([
    [true, 1],
    [false, 0]
  ])('updates a receiver material only when the shadow map is enabled (enabled=%s)', (enabled, applied) => {
    const renderSpy = vi.spyOn(CadShadowPass.prototype, 'render');
    const rendererMock = autoMockWebGLRenderer(new Mock<WebGLRenderer>());
    const material = createReceiverMaterial();
    const pass = new PostProcessingPass(scene, createOptions({ map: createShadowMap(enabled) }));

    const camera = new PerspectiveCamera();
    pass.render(rendererMock.object(), camera);
    material.onBeforeRender(rendererMock.object(), scene, camera, undefined, undefined, undefined);

    expect(renderSpy).toHaveBeenCalledTimes(applied);
    expect(material.uniforms.cadShadowApply.value).toBe(applied);
    renderSpy.mockRestore();
  });

  test('skips all shadow work when no shadow map is configured', () => {
    const renderSpy = vi.spyOn(CadShadowPass.prototype, 'render');
    const rendererMock = autoMockWebGLRenderer(new Mock<WebGLRenderer>());
    const pass = new PostProcessingPass(scene, createOptions());

    pass.render(rendererMock.object(), new PerspectiveCamera());

    expect(renderSpy).not.toHaveBeenCalled();
    renderSpy.mockRestore();
  });

  test('setSize and dispose forward to the cad shadow pass', () => {
    const setSizeSpy = vi.spyOn(CadShadowPass.prototype, 'setSize');
    const disposeSpy = vi.spyOn(CadShadowPass.prototype, 'dispose');
    const material = createReceiverMaterial();
    const pass = new PostProcessingPass(scene, createOptions({ map: createShadowMap(true) }));
    const camera = new PerspectiveCamera();
    const renderer = autoMockWebGLRenderer(new Mock<WebGLRenderer>()).object();
    pass.render(renderer, camera);
    material.onBeforeRender(renderer, scene, camera, undefined, undefined, undefined);

    pass.setSize(64, 32);
    pass.dispose();
    material.onBeforeRender(renderer, scene, camera, undefined, undefined, undefined);

    expect(setSizeSpy).toHaveBeenCalledWith(64, 32);
    expect(disposeSpy).toHaveBeenCalledOnce();
    expect(material.uniforms.cadShadowApply.value).toBe(0);
    setSizeSpy.mockRestore();
    disposeSpy.mockRestore();
  });

  test('adopts an up-facing plane when the custom object is added', () => {
    const mesh = new Mesh(new PlaneGeometry(10, 8), new MeshBasicMaterial({ color: '#446688' }));
    mesh.rotation.x = -Math.PI / 2;
    const customObject = new Mock<ICustomObject>()
      .setup(p => p.object)
      .returns(mesh)
      .setup(p => p.receiveShadow)
      .returns(true)
      .object();
    const pass = new PostProcessingPass(scene, createOptions({ map: createShadowMap(true) }));
    pass.setReceiversForCustomObjectsEnabled(true);

    expect(mesh.material).toBeInstanceOf(MeshBasicMaterial);

    pass.adoptCustomObject(customObject);

    expect(mesh.material).toBeInstanceOf(CustomObjectEffectMaterial);
  });

  test('swaps the receiver material only when shadows are turned on or off', () => {
    const renderSpy = vi.spyOn(CadShadowPass.prototype, 'render').mockImplementation(() => undefined);
    const source = new MeshBasicMaterial({ color: '#446688' });
    const mesh = new Mesh(new PlaneGeometry(10, 8), source);
    mesh.rotation.x = -Math.PI / 2;
    const customObject = new Mock<ICustomObject>()
      .setup(p => p.object)
      .returns(mesh)
      .setup(p => p.receiveShadow)
      .returns(true)
      .object();
    const pass = new PostProcessingPass(scene, createOptions({ map: createShadowMap(true) }));
    const renderer = autoMockWebGLRenderer(new Mock<WebGLRenderer>()).object();
    const camera = new PerspectiveCamera();

    pass.setReceiversForCustomObjectsEnabled(true);
    pass.adoptCustomObject(customObject);
    const receiver = mesh.material;
    expect(receiver).toBeInstanceOf(CustomObjectEffectMaterial);

    pass.render(renderer, camera);
    expect(mesh.material).toBe(receiver);

    pass.setReceiversForCustomObjectsEnabled(false);
    expect(mesh.material).toBe(source);

    pass.render(renderer, camera);
    expect(mesh.material).toBe(source);

    pass.setReceiversForCustomObjectsEnabled(true);
    expect(mesh.material).toBe(receiver);

    renderSpy.mockRestore();
  });
});
