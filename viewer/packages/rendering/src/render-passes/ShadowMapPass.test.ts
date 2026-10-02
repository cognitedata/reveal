/*!
 * Copyright 2026 Cognite AS
 */

import type { WebGLRenderer } from 'three';
import { Box3, Vector3 } from 'three';
import { It, Mock, Times } from 'moq.ts';
import * as RevealUtilities from '@reveal/utilities';
import { resolveShadowMapResolution, ShadowMapPass } from './ShadowMapPass';
import { CadMaterialManager } from '../CadMaterialManager';
import { autoMockWebGLRenderer } from '../../../../test-utilities';

describe(ShadowMapPass.name, () => {
  const sceneHandler = new RevealUtilities.SceneHandler();
  const materialManager = new CadMaterialManager();
  const bounds = new Box3(new Vector3(-1, -1, -1), new Vector3(1, 1, 1));

  test('is disabled until both user-enabled and given non-empty bounds', () => {
    const pass = new ShadowMapPass(sceneHandler, materialManager, false);
    expect(pass.enabled).toBe(false);

    pass.setEnabled(true);
    expect(pass.enabled).toBe(false);

    pass.setCadBounds(bounds);
    expect(pass.enabled).toBe(true);

    pass.setCadBounds(new Box3());
    expect(pass.enabled).toBe(false);
  });

  test('setCadBounds fits the light frustum around the given bounds', () => {
    const pass = new ShadowMapPass(sceneHandler, materialManager, true);

    pass.setCadBounds(bounds);

    expect(pass.texelWorldSize).toBeGreaterThan(0);
    expect(pass.depthRange).toBeGreaterThan(0);
    expect(pass.matrix.determinant()).not.toBe(0);
  });

  test('render only binds the target and draws when enabled', () => {
    const rendererMock = autoMockWebGLRenderer(new Mock<WebGLRenderer>());
    const pass = new ShadowMapPass(sceneHandler, materialManager, false);

    pass.render(rendererMock.object());
    rendererMock.verify(p => p.setRenderTarget(It.IsAny()), Times.Never());
    rendererMock.verify(p => p.clear(), Times.Never());

    pass.setEnabled(true);
    pass.setCadBounds(bounds);
    pass.render(rendererMock.object());

    rendererMock.verify(p => p.setRenderTarget(It.IsAny()), Times.Once());
    rendererMock.verify(p => p.clear(), Times.Once());
    rendererMock.verify(p => p.render(sceneHandler.scene, It.IsAny()), Times.Once());
  });

  test('render clamps the shadow map when the GPU cannot fit 4096', () => {
    const rendererMock = autoMockWebGLRenderer(new Mock<WebGLRenderer>(), { maxTextureSize: 1024 });
    const pass = new ShadowMapPass(sceneHandler, materialManager, true);
    pass.setCadBounds(bounds);
    const desktopTexel = pass.texelWorldSize;

    pass.render(rendererMock.object());

    expect(pass.texelWorldSize).toBeCloseTo(desktopTexel * (4096 / 1024));
  });

  test('render uses a 2048 map on mobile when the GPU allows 4096', () => {
    vi.spyOn(RevealUtilities, 'isMobileOrTablet').mockReturnValue(true);
    const rendererMock = autoMockWebGLRenderer(new Mock<WebGLRenderer>(), { maxTextureSize: 4096 });
    const pass = new ShadowMapPass(sceneHandler, materialManager, true);
    pass.setCadBounds(bounds);
    const desktopTexel = pass.texelWorldSize;

    pass.render(rendererMock.object());

    expect(pass.texelWorldSize).toBeCloseTo(desktopTexel * (4096 / 2048));
  });
});

describe(resolveShadowMapResolution.name, () => {
  test.each([
    [8192, false, 4096],
    [4096, false, 4096],
    [2048, false, 2048],
    [1024, false, 1024],
    [8192, true, 2048],
    [2048, true, 2048],
    [1024, true, 1024],
    [0, false, 4096],
    [Number.NaN, true, 2048]
  ])('maxTextureSize %s, mobile %s -> %s', (maxTextureSize, mobileOrTablet, expected) => {
    expect(resolveShadowMapResolution(maxTextureSize, mobileOrTablet)).toBe(expected);
  });
});
