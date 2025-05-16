/*!
 * Copyright 2022 Cognite AS
 */
import { ResizeHandler } from './ResizeHandler';
import { CameraChangeDelegate, CameraManager, StationaryCameraManager } from '@reveal/camera-manager';

import { PerspectiveCamera, WebGLRenderer, Vector2, Vector3 } from 'three';

import { jest } from '@jest/globals';

import { Mock, It } from 'moq.ts';

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

    jest.clearAllMocks();
  });

  test('set resolution threshold is persisted as stoppedCameraResolutionThreshold', () => {
    const resolutionThreshold0 = 1.5e6;
    const resolutionThreshold1 = 4.5e6;

    const resizeHandler = new ResizeHandler(renderer, cameraManager);

    resizeHandler.setResolutionThreshold(resolutionThreshold0);
    expect(resizeHandler.getStoppedCameraResolutionThreshold()).toBe(resolutionThreshold0);

    resizeHandler.setResolutionThreshold(resolutionThreshold1);
    expect(resizeHandler.getStoppedCameraResolutionThreshold()).toBe(resolutionThreshold1);
  });

  test('set move resolution factor is persisted', () => {
    const resolutionFactor0 = 0.8;
    const resolutionFactor1 = 0.23;

    const resizeHandler = new ResizeHandler(renderer, cameraManager);

    resizeHandler.setMovingCameraResolutionFactor(resolutionFactor0);
    expect(resizeHandler.getMovingCameraResolutionFactor()).toBe(resolutionFactor0);

    resizeHandler.setMovingCameraResolutionFactor(resolutionFactor1);
    expect(resizeHandler.getMovingCameraResolutionFactor()).toBe(resolutionFactor1);
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

  test('throws on movingCameraFactor outside range', () => {
    const resizeHandler = new ResizeHandler(renderer, cameraManager);

    expect(() => resizeHandler.setMovingCameraResolutionFactor(0)).toThrow();
    expect(() => resizeHandler.setMovingCameraResolutionFactor(-1)).toThrow();

    expect(() => resizeHandler.setMovingCameraResolutionFactor(1)).not.toThrow();
    expect(() => resizeHandler.setMovingCameraResolutionFactor(1.1)).toThrow();
  });

  test('callback registers both events only once on several non-one move factor updates', () => {
    const resizeHandler = new ResizeHandler(renderer, cameraManager);
    const onSpy = jest.spyOn(cameraManager, 'on');

    resizeHandler.setMovingCameraResolutionFactor(0.5);
    resizeHandler.setMovingCameraResolutionFactor(0.8);
    resizeHandler.setMovingCameraResolutionFactor(0.2);
    resizeHandler.setMovingCameraResolutionFactor(0.1);

    expect(onSpy.mock.calls).toHaveLength(2);
  });

  test('callback unregisters when move factor is 1', () => {
    const resizeHandler = new ResizeHandler(renderer, cameraManager);
    const offSpy = jest.spyOn(cameraManager, 'off');

    resizeHandler.setMovingCameraResolutionFactor(0.5);
    expect(offSpy.mock.calls).toHaveLength(0);

    resizeHandler.setMovingCameraResolutionFactor(1);
    expect(offSpy.mock.calls).toHaveLength(2);
  });

  test('callback registers and registers correctly multiple times', () => {
    const resizeHandler = new ResizeHandler(renderer, cameraManager);
    const onSpy = jest.spyOn(cameraManager, 'on');
    const offSpy = jest.spyOn(cameraManager, 'off');

    resizeHandler.setMovingCameraResolutionFactor(0.5);
    resizeHandler.setMovingCameraResolutionFactor(1);
    resizeHandler.setMovingCameraResolutionFactor(0.5);
    resizeHandler.setMovingCameraResolutionFactor(1);

    expect(onSpy.mock.calls).toHaveLength(4);
    expect(offSpy.mock.calls).toHaveLength(4);
  });

  test('movement factor is relative to max size', () => {
    let cameraChangeEventHandler: CameraChangeDelegate;
    const cameraManager = new Mock<CameraManager>()
      .setup(p => p.on('cameraChange', It.IsAny()))
      .callback(({ args: [_, eventHandler] }) => {
        cameraChangeEventHandler = eventHandler;
      })
      .setup(p => p.getCamera())
      .returns(camera)
      .object();

    const resizeHandler = new ResizeHandler(renderer, cameraManager);

    const originalRenderResolution = getRendererResolution(renderer);

    resizeHandler.setResolutionThreshold(0.5 * originalRenderResolution);
    resizeHandler.setMovingCameraResolutionFactor(0.25);
    cameraChangeEventHandler!(new Vector3(), new Vector3());
    resizeHandler.handleResize(cameraManager.getCamera());

    const afterFactorChangeResolution = getRendererResolution(renderer);

    expect(afterFactorChangeResolution).toBe(0.25 * originalRenderResolution);
  });
});

function getRendererResolution(renderer: WebGLRenderer): number {
  const originalSize = new Vector2();
  renderer.getSize(originalSize);
  return originalSize.x * originalSize.y;
}
