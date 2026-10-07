/*!
 * Copyright 2026 Cognite AS
 */

import type { WebGLRenderer } from 'three';
import { DepthTexture, Matrix4, Mesh, MeshBasicMaterial, PerspectiveCamera, PlaneGeometry, Scene } from 'three';
import { Mock } from 'moq.ts';
import { vi } from 'vitest';
import type { ICustomObject } from '@reveal/utilities';
import { PostProcessingPass } from './PostProcessingPass';
import type { CadShadowMap, PostProcessingPipelineOptions } from '../render-pipeline-providers/types';
import { CadShadowPass } from './CadShadowPass';
import { CadShadowReceiverForCustomObjectMaterial } from '../rendering/CadShadowReceiverForCustomObjectMaterial';
import { createRenderTarget } from '../utilities/renderUtilities';
import { defaultRenderOptions } from '../rendering/types';
import { autoMockWebGLRenderer } from '../../../../test-utilities';

function createOptions(cadShadow?: { map: CadShadowMap }): PostProcessingPipelineOptions {
  return {
    currentRenderSize: new Vector2(),
    back: createRenderTarget(),
    ghost: createRenderTarget(),
    inFront: createRenderTarget(),
    pointCloudLogDepth: createRenderTarget(),
    pointCloud: createRenderTarget(),
    ssaoTexture: createRenderTarget().texture,
    cadShadow,
    edges: false,
    edlOptions: defaultRenderOptions.pointCloudParameters.edlOptions
  };
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
    .setup(p => p.depthRange)
    .returns(1)
    .object();
}

describe(PostProcessingPass.name, () => {
  const scene = new Scene();

  function createReceiverMaterial() {
    return new CadShadowReceiverForCustomObjectMaterial('#88aa44');
  }

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

    expect(mesh.material).toBeInstanceOf(CadShadowReceiverForCustomObjectMaterial);
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
    expect(receiver).toBeInstanceOf(CadShadowReceiverForCustomObjectMaterial);

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
