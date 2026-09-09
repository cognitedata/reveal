/*!
 * Copyright 2026 Cognite AS
 */

import { It, Mock } from 'moq.ts';
import type { WebGLRenderer, WebGLRenderTarget, Texture } from 'three';
import { PerspectiveCamera, Vector2 } from 'three';
import { SceneHandler } from '@reveal/utilities';
import { PointCloudMaterialManager } from '../PointCloudMaterialManager';
import { PointSizeType } from '../pointcloud-rendering';
import { defaultRenderOptions } from '../rendering/types';
import { PointCloudRenderPipelineProvider } from './PointCloudRenderPipelineProvider';

describe('PointCloudRenderPipelineProvider edge reference', () => {
  test.each([false, true])('uses a separate, current-frame reference with blending=%s', pointBlending => {
    const manager = new PointCloudMaterialManager();
    const id = Symbol('point cloud');
    manager.addModelMaterial(id, { annotationToObjectIds: new Map(), objectToAnnotationIds: new Map() });
    const material = manager.getModelMaterial(id);
    const provider = new PointCloudRenderPipelineProvider(new SceneHandler(), manager, {
      ...defaultRenderOptions.pointCloudParameters,
      pointBlending
    });
    const size = new Vector2(1280, 720);
    let target: WebGLRenderTarget | null = null;
    const renders: { target: WebGLRenderTarget | null; reference: Texture | null; colorWrite: boolean }[] = [];
    const renderer = new Mock<WebGLRenderer>()
      .setup(r => r.getDrawingBufferSize(It.IsAny()))
      .callback(({ args: [out] }) => out.copy(size))
      .setup(r => r.setRenderTarget(It.IsAny()))
      .callback(({ args: [value] }) => {
        target = value;
      })
      .setup(r => r.setClearColor(It.IsAny(), It.IsAny()))
      .returns()
      .setup(r => r.clearColor())
      .returns()
      .setup(r => r.render(It.IsAny(), It.IsAny()))
      .callback(() => {
        renders.push({ target, reference: material.edgeDepthTexture, colorWrite: material.colorWrite });
      })
      .object();
    const camera = new PerspectiveCamera();
    const render = () => {
      renders.length = 0;
      for (const pass of provider.pipeline(renderer)) pass.render(renderer, camera);
    };

    render();
    expect(renders).toHaveLength(pointBlending ? 3 : 2);
    const referenceTarget = renders[0].target!;
    expect(renders[0].reference).toBeNull();
    expect(renders[0].colorWrite).toBe(false);
    expect(referenceTarget.width).toBe(1280);
    expect(referenceTarget.height).toBe(720);
    for (const pass of renders.slice(1)) {
      expect(pass.reference).toBe(referenceTarget.depthTexture);
      expect(pass.target?.depthTexture).not.toBe(pass.reference);
      expect(pass.colorWrite).toBe(true);
    }

    size.set(640, 480);
    render();
    expect(renders[0].reference).toBeNull();
    expect(referenceTarget.width).toBe(640);
    expect(referenceTarget.height).toBe(480);

    for (const type of [PointSizeType.Fixed, PointSizeType.Attenuated]) {
      material.pointSizeType = type;
      render();
      expect(renders).toHaveLength(pointBlending ? 2 : 1);
      expect(material.edgeDepthTexture).toBeNull();
    }
    material.pointSizeType = PointSizeType.Adaptive;
    render();
    expect(material.edgeDepthTexture).toBe(referenceTarget.depthTexture);
    provider.dispose();
    expect(material.edgeDepthTexture).toBeNull();
    manager.dispose();
  });
});
