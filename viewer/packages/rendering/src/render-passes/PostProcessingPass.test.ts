/*!
 * Copyright 2026 Cognite AS
 */

import type { WebGLRenderer } from 'three';
import { DepthTexture, Matrix4, PerspectiveCamera, Scene, Vector2 } from 'three';
import { Mock } from 'moq.ts';
import { vi } from 'vitest';
import { PostProcessingPass } from './PostProcessingPass';
import type { CadShadowMap, PostProcessingPipelineOptions } from '../render-pipeline-providers/types';
import { CadShadowPass } from './CadShadowPass';
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

  test.each([
    [true, 1],
    [false, 0]
  ])('renders the shadow pass only when the shadow map is enabled (enabled=%s)', (enabled, calls) => {
    const renderSpy = vi.spyOn(CadShadowPass.prototype, 'render');
    const rendererMock = autoMockWebGLRenderer(new Mock<WebGLRenderer>());
    const pass = new PostProcessingPass(scene, createOptions({ map: createShadowMap(enabled) }));

    pass.render(rendererMock.object(), new PerspectiveCamera());

    expect(renderSpy).toHaveBeenCalledTimes(calls);
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
    const pass = new PostProcessingPass(scene, createOptions({ map: createShadowMap(true) }));

    pass.setSize(64, 32);
    pass.dispose();

    expect(setSizeSpy).toHaveBeenCalledWith(64, 32);
    expect(disposeSpy).toHaveBeenCalledOnce();
    setSizeSpy.mockRestore();
    disposeSpy.mockRestore();
  });
});
