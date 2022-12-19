/*!
 * Copyright 2022 Cognite AS
 */
import { ResizeHandler } from './ResizeHandler';
import { StationaryCameraManager } from '@reveal/camera-manager';

import { PerspectiveCamera, WebGLRenderer, Vector2 } from 'three';

import { Mock } from 'moq.ts';

describe(ResizeHandler.name, () => {
  const initialWidth = 1280;
  const initialHeight = 720;
  const dimensions = { width: 0, height: 0 };

  const camera = new PerspectiveCamera();
  const domElement = new Mock<HTMLCanvasElement>()
    .setup(p => p.parentElement)
    .returns(
      new Mock<HTMLElement>()
        .setup(p => p.clientWidth)
        .returns(initialWidth)
        .setup(p => p.clientHeight)
        .returns(initialHeight)
        .object()
    )
    .object();
  const renderer = new Mock<WebGLRenderer>()
    .setup(p => p.domElement)
    .returns(domElement)
    .setup(p => p.getSize)
    .returns(v => v.set(dimensions.width, dimensions.height))
    .setup(p => p.getPixelRatio())
    .returns(1)
    .setup(p => p.setDrawingBufferSize)
    .returns((w, h) => {
      dimensions.width = w;
      dimensions.height = h;
    })
    .object();
  const cameraManager = new StationaryCameraManager(domElement, camera);

  beforeEach(() => {
    dimensions.width = initialWidth;
    dimensions.height = initialHeight;
  });

  test('signals redraw on resolution update', () => {
    const resizeHandler = new ResizeHandler(renderer, cameraManager);

    expect(resizeHandler.needsRedraw).toBeFalse();

    resizeHandler.setResolutionThreshold(1000);

    expect(resizeHandler.needsRedraw).toBeTrue();
  });

  test('resetRedraw turns off needsRedraw signal', () => {
    const resizeHandler = new ResizeHandler(renderer, cameraManager);
    resizeHandler.setResolutionThreshold(1000);

    expect(resizeHandler.needsRedraw).toBeTrue();

    resizeHandler.resetRedraw();

    expect(resizeHandler.needsRedraw).toBeFalse();
  });

  test('handleResize resizes render target within threshold', () => {
    const resizeHandler = new ResizeHandler(renderer, cameraManager);
    const renderSize = new Vector2();
    renderer.getSize(renderSize);
    expect(renderSize.x * renderSize.y).toEqual(initialWidth * initialHeight);

    const newMaxResolution = 1e5;

    resizeHandler.setResolutionThreshold(newMaxResolution);
    resizeHandler.handleResize(camera);

    renderer.getSize(renderSize);
    expect(renderSize.x * renderSize.y).toBeLessThan(1.01 * newMaxResolution);
    expect(renderSize.x * renderSize.y).toBeGreaterThan(0.99 * newMaxResolution);
  });
});
