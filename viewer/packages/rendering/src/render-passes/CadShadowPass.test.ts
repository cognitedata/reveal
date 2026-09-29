/*!
 * Copyright 2026 Cognite AS
 */

import type { WebGLRenderer } from 'three';
import { Matrix4, PerspectiveCamera } from 'three';
import { It, Mock, Times } from 'moq.ts';
import { CadShadowPass } from './CadShadowPass';
import type { CadShadowMap } from '../render-pipeline-providers/types';
import { autoMockWebGLRenderer } from '../../../../test-utilities';

describe(CadShadowPass.name, () => {
  const shadowMap = new Mock<CadShadowMap>()
    .setup(p => p.matrix)
    .returns(new Matrix4())
    .object();

  test('render draws into its own target and restores the renderer state', () => {
    const rendererMock = autoMockWebGLRenderer(new Mock<WebGLRenderer>());

    new CadShadowPass(null, shadowMap).render(rendererMock.object(), new PerspectiveCamera());

    rendererMock.verify(p => p.render(It.IsAny(), It.IsAny()), Times.Once());
    rendererMock.verify(p => p.setRenderTarget(null), Times.Once());
    rendererMock.verify(p => p.setClearColor(It.IsAny(), 0), Times.Once());
  });
});
