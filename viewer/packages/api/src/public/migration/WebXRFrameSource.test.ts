/*!
 * Copyright 2026 Cognite AS
 */

import {
  Box3,
  EventDispatcher,
  PerspectiveCamera,
  Vector3,
  Vector4,
  WebGLRenderTarget,
  type WebGLRenderer
} from 'three';
import { vi } from 'vitest';
import { WebXRFrameSource, type WebXRFrameSourceCallbacks } from './WebXRFrameSource';

type XRSessionEventMap = { sessionstart: object; sessionend: object };

class FakeXR extends EventDispatcher<XRSessionEventMap> {
  enabled = false;
  isPresenting = false;
  readonly setAnimationLoop = vi.fn();
  readonly session = { end: vi.fn(async () => {}) };
  readonly eyes = [0, 1].map(index => {
    const eye = new PerspectiveCamera();
    eye.updateMatrixWorld(true);
    eye.viewport = new Vector4(index * 400, 0, 400, 300);
    return eye;
  });
  readonly updateCamera = vi.fn((head: PerspectiveCamera) => {
    head.position.set(0, 1.6, 0);
    head.updateMatrixWorld(true);
  });

  getCamera() {
    return { cameras: this.eyes };
  }

  getReferenceSpace() {
    return this.isPresenting ? ({} as XRReferenceSpace) : null;
  }

  getSession() {
    return this.isPresenting ? this.session : null;
  }

  startSession(): void {
    this.isPresenting = true;
    this.dispatchEvent({ type: 'sessionstart' });
  }

  endSession(): void {
    this.isPresenting = false;
    this.dispatchEvent({ type: 'sessionend' });
  }
}

const trackedFrame = { getViewerPose: () => ({}) } as unknown as XRFrame;
const untrackedFrame = { getViewerPose: () => null } as unknown as XRFrame;
const sceneBox = new Box3(new Vector3(-1, 0, -2), new Vector3(1, 1, -1));

describe(WebXRFrameSource.name, () => {
  let xr: FakeXR;
  let boundTarget: WebGLRenderTarget | null;
  let renderer: WebGLRenderer;
  let callbacks: { [K in keyof WebXRFrameSourceCallbacks]: ReturnType<typeof vi.fn<WebXRFrameSourceCallbacks[K]>> };

  beforeEach(() => {
    xr = new FakeXR();
    boundTarget = new WebGLRenderTarget(800, 300);
    renderer = { xr, getRenderTarget: () => boundTarget } as unknown as WebGLRenderer;
    callbacks = { onSessionStart: vi.fn(), onSessionEnd: vi.fn(), onFrame: vi.fn() };
  });

  function getFrameLoop(): (time: number, frame?: XRFrame) => void {
    return xr.setAnimationLoop.mock.calls.at(-1)![0];
  }

  test('is not presenting until a session starts', () => {
    const source = new WebXRFrameSource(renderer, callbacks, false);

    expect(source.isPresenting).toBe(false);
    expect(xr.setAnimationLoop).not.toHaveBeenCalled();
  });

  test('takes over the frame loop when a session starts and hands it back when it ends', () => {
    const source = new WebXRFrameSource(renderer, callbacks, false);

    xr.startSession();
    expect(source.isPresenting).toBe(true);
    expect(callbacks.onSessionStart).toHaveBeenCalledTimes(1);
    expect(xr.setAnimationLoop).toHaveBeenLastCalledWith(expect.any(Function));

    xr.endSession();
    expect(source.isPresenting).toBe(false);
    expect(callbacks.onSessionEnd).toHaveBeenCalledTimes(1);
    expect(xr.setAnimationLoop).toHaveBeenLastCalledWith(null);
  });

  test('forwards XR frames and ignores calls without a frame', () => {
    new WebXRFrameSource(renderer, callbacks, false);
    xr.startSession();
    const loop = getFrameLoop();

    loop(16, trackedFrame);
    loop(32, undefined);

    expect(callbacks.onFrame).toHaveBeenCalledTimes(1);
    expect(callbacks.onFrame).toHaveBeenCalledWith(16, trackedFrame);
  });

  test('catches exceptions from frames so the XR frame loop keeps running', () => {
    callbacks.onFrame.mockImplementation(() => {
      throw new Error('frame failed');
    });
    new WebXRFrameSource(renderer, callbacks, false);
    xr.startSession();

    expect(() => getFrameLoop()(16, trackedFrame)).not.toThrow();
  });

  test('beginFrame() returns the XR framebuffer target and one view per eye', () => {
    const source = new WebXRFrameSource(renderer, callbacks, false);
    xr.startSession();

    const frame = source.beginFrame(trackedFrame, sceneBox, []);

    expect(frame).toBeDefined();
    expect(frame!.output).toBe(boundTarget);
    expect(frame!.views.map(view => view.viewport)).toEqual(xr.eyes.map(eye => eye.viewport));
    expect(frame!.viewSize.toArray()).toEqual([400, 300]);
    expect(frame!.camera.position.toArray()).toEqual([0, 1.6, 0]);
    expect(frame!.loadingCameraInMotion).toBe(true);
  });

  test('beginFrame() skips frames without a viewer pose or framebuffer', () => {
    const source = new WebXRFrameSource(renderer, callbacks, false);
    xr.startSession();

    expect(source.beginFrame(untrackedFrame, sceneBox, [])).toBeUndefined();

    boundTarget = null;
    expect(source.beginFrame(trackedFrame, sceneBox, [])).toBeUndefined();
  });

  test('turns off xr.enabled during the session and restores it afterwards', () => {
    xr.enabled = true;
    new WebXRFrameSource(renderer, callbacks, false);

    xr.startSession();
    expect(xr.enabled).toBe(false);

    xr.endSession();
    expect(xr.enabled).toBe(true);
  });

  test('starts immediately when a session is already presenting', () => {
    xr.isPresenting = true;

    const source = new WebXRFrameSource(renderer, callbacks, false);

    expect(source.isPresenting).toBe(true);
    expect(callbacks.onSessionStart).toHaveBeenCalledTimes(1);
  });

  test('dispose() stops listening and releases the frame loop', () => {
    const source = new WebXRFrameSource(renderer, callbacks, false);
    xr.startSession();

    source.dispose();
    xr.endSession();
    xr.startSession();

    expect(xr.setAnimationLoop).toHaveBeenCalledTimes(2); // Session start and dispose.
    expect(xr.setAnimationLoop).toHaveBeenLastCalledWith(null);
    expect(callbacks.onSessionEnd).not.toHaveBeenCalled();
  });

  test('dispose() ends the session only when the viewer owns the renderer', () => {
    const appRenderer = new WebXRFrameSource(renderer, callbacks, false);
    xr.startSession();
    appRenderer.dispose();
    expect(xr.session.end).not.toHaveBeenCalled();

    const ownRenderer = new WebXRFrameSource(renderer, callbacks, true);
    ownRenderer.dispose();
    expect(xr.session.end).toHaveBeenCalledTimes(1);
  });
});
