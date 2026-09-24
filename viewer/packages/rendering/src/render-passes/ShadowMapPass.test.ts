/*!
 * Copyright 2026 Cognite AS
 */

import type { WebGLRenderer } from 'three';
import { Box3, Vector3 } from 'three';
import { It, Mock, Times } from 'moq.ts';
import { SceneHandler } from '@reveal/utilities';
import { ShadowMapPass } from './ShadowMapPass';
import { CadMaterialManager } from '../CadMaterialManager';
import { autoMockWebGLRenderer } from '../../../../test-utilities';

describe(ShadowMapPass.name, () => {
  const sceneHandler = new SceneHandler();
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

    pass.setEnabled(true);
    pass.setCadBounds(bounds);
    pass.render(rendererMock.object());

    rendererMock.verify(p => p.setRenderTarget(It.IsAny()), Times.Once());
    rendererMock.verify(p => p.render(sceneHandler.scene, It.IsAny()), Times.Once());
  });
});
