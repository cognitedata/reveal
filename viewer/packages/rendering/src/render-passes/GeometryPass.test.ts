/*!
 * Copyright 2026 Cognite AS
 */

import type { WebGLRenderer } from 'three';
import { Object3D, PerspectiveCamera } from 'three';
import { It, Mock, Times, type IMock } from 'moq.ts';
import type { CadMaterialManager } from '../CadMaterialManager';
import { RenderMode } from '../rendering/RenderMode';
import { autoMockWebGLRenderer } from '../../../../test-utilities';
import { GeometryPass } from './GeometryPass';

describe(GeometryPass.name, () => {
  const scene = new Object3D();
  const camera = new PerspectiveCamera();

  function render(mode: RenderMode): IMock<CadMaterialManager> {
    const materialManager = new Mock<CadMaterialManager>()
      .setup(p => p.getRenderMode())
      .returns(RenderMode.Color)
      .setup(p => p.setRenderMode(It.IsAny()))
      .returns()
      .setup(p => p.updateViewLighting(It.IsAny()))
      .returns();
    const renderer = autoMockWebGLRenderer(new Mock<WebGLRenderer>());
    new GeometryPass(scene, materialManager.object(), mode).render(renderer.object(), camera);
    return materialManager;
  }

  test.each([RenderMode.Color, RenderMode.Ghost, RenderMode.Effects])('render mode %s updates view lighting', mode => {
    const materialManager = render(mode);
    materialManager.verify(p => p.updateViewLighting(camera), Times.Once());
  });

  test.each([RenderMode.Depth, RenderMode.TreeIndex, RenderMode.DepthBufferOnly])(
    'render mode %s skips view lighting',
    mode => {
      const materialManager = render(mode);
      materialManager.verify(p => p.updateViewLighting(It.IsAny()), Times.Never());
    }
  );
});
