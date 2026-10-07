/*!
 * Copyright 2026 Cognite AS
 */

import {
  EventDispatcher,
  PerspectiveCamera,
  Ray,
  Vector2,
  Vector3,
  Vector4,
  WebGLRenderTarget,
  type WebGLRenderer
} from 'three';
import { CogniteClient } from '@cognite/sdk';
import type { SectorCuller } from '@reveal/cad-geometry-loaders';
import type { IntersectInput } from '@reveal/model-base';
import type { RenderView } from '@reveal/rendering';
import { It, Mock } from 'moq.ts';
import { vi } from 'vitest';

import { Cognite3DViewer } from './Cognite3DViewer';
import { mockClientAuthentication, autoMockWebGLRenderer } from '../../../../../test-utilities';

type XRSessionEventMap = { sessionstart: object; sessionend: object };

/** Stand-in for three's WebXRManager with just what the viewer uses. */
class FakeXR extends EventDispatcher<XRSessionEventMap> {
  enabled = false;
  isPresenting = false;
  readonly setAnimationLoop = vi.fn();
  readonly session = { end: vi.fn(async () => {}) };
  readonly referenceSpace = {} as XRReferenceSpace;
  readonly eyes = [0, 1].map(index => {
    const eye = new PerspectiveCamera();
    eye.position.set(index === 0 ? -0.03 : 0.03, 1.6, 0);
    eye.updateMatrixWorld(true);
    eye.viewport = new Vector4(index * 500, 0, 500, 500);
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
    return this.isPresenting ? this.referenceSpace : null;
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

type ViewerInternals = {
  revealManager: { renderViews: (output: WebGLRenderTarget, views: readonly RenderView[]) => void };
  _pickingHandler: { intersectCadNodes: (...args: unknown[]) => Promise<unknown[]> };
  _pointCloudPickingHandler: { intersectPointClouds: (...args: unknown[]) => Promise<unknown[]> };
};

describe('Cognite3DViewer WebXR', () => {
  const sdk = new CogniteClient({ appId: 'cognite.reveal.unittest', project: 'dummy', getToken: async () => 'dummy' });
  mockClientAuthentication(sdk);
  const _sectorCuller = new Mock<SectorCuller>()
    .setup(p => p.determineSectors(It.IsAny()))
    .returns({ wantedSectors: [], spentBudget: {} as ReturnType<SectorCuller['determineSectors']>['spentBudget'] })
    .setup(p => p.dispose)
    .returns(vi.fn())
    .object();

  let xr: FakeXR;
  let xrTarget: WebGLRenderTarget;
  let renderer: WebGLRenderer;
  let viewer: Cognite3DViewer;
  let renderViews: ReturnType<typeof vi.fn<ViewerInternals['revealManager']['renderViews']>>;

  beforeEach(() => {
    vi.useFakeTimers();
    xr = new FakeXR();
    xrTarget = new WebGLRenderTarget(1000, 500);
    renderer = autoMockWebGLRenderer(new Mock<WebGLRenderer>(), { xr: xr as unknown as WebGLRenderer['xr'] }).object();
    renderer.render = vi.fn();
    renderer.getRenderTarget = vi.fn(() => xrTarget);

    viewer = new Cognite3DViewer({ sdk, renderer, _sectorCuller, logMetrics: false });
    renderViews = vi.fn<ViewerInternals['revealManager']['renderViews']>();
    (viewer as unknown as ViewerInternals).revealManager.renderViews = renderViews;
  });

  afterEach(() => {
    viewer.dispose();
    vi.clearAllTimers();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  /** An XR frame with a viewer pose. */
  const trackedFrame = { getViewerPose: () => ({}) } as unknown as XRFrame;
  /** An XR frame where tracking is lost. */
  const untrackedFrame = { getViewerPose: () => null } as unknown as XRFrame;

  function getXRFrameLoop(): (time: number, frame?: XRFrame) => void {
    const loop = xr.setAnimationLoop.mock.calls.at(-1)?.[0];
    expect(loop).toBeTypeOf('function');
    return loop;
  }

  test('drives rendering from the XR session while presenting', () => {
    xr.startSession();

    expect(xr.setAnimationLoop).toHaveBeenCalledTimes(1);
    const requestAnimationFrameSpy = vi.spyOn(window, 'requestAnimationFrame');

    getXRFrameLoop()(16, trackedFrame);

    // The window loop is not rescheduled while presenting.
    expect(requestAnimationFrameSpy).not.toHaveBeenCalled();
    expect(renderViews).toHaveBeenCalledTimes(1);
  });

  test('renders one view per eye into the XR framebuffer target', () => {
    xr.startSession();

    getXRFrameLoop()(16, trackedFrame);

    const [output, views] = renderViews.mock.calls[0] as [WebGLRenderTarget, RenderView[]];
    expect(output).toBe(xrTarget);
    expect(views).toHaveLength(2);
    expect(views.map(view => view.viewport)).toEqual(xr.eyes.map(eye => eye.viewport));
    expect(views[0].camera.matrixWorld.equals(xr.eyes[0].matrixWorld)).toBe(true);
  });

  test('renders every XR frame, even when nothing changed', () => {
    xr.startSession();
    const loop = getXRFrameLoop();

    loop(16, trackedFrame);
    loop(32, trackedFrame);
    loop(48, trackedFrame);

    expect(renderViews).toHaveBeenCalledTimes(3);
  });

  test('fires beforeSceneRendered and sceneRendered with the head camera', () => {
    const beforeSceneRendered = vi.fn();
    const sceneRendered = vi.fn();
    viewer.on('beforeSceneRendered', beforeSceneRendered);
    viewer.on('sceneRendered', sceneRendered);
    xr.startSession();

    getXRFrameLoop()(16, trackedFrame);

    expect(beforeSceneRendered).toHaveBeenCalledTimes(1);
    expect(sceneRendered).toHaveBeenCalledTimes(1);
    const { camera } = beforeSceneRendered.mock.calls[0][0];
    expect(xr.updateCamera).toHaveBeenCalledWith(camera);
    expect(camera.position.toArray()).toEqual([0, 1.6, 0]);
  });

  test('ignores window frames that arrive while presenting', () => {
    xr.startSession();

    getXRFrameLoop()(16, undefined);

    expect(renderViews).not.toHaveBeenCalled();
  });

  test('returns to the window loop when the session ends', () => {
    xr.startSession();
    const requestAnimationFrameSpy = vi.spyOn(window, 'requestAnimationFrame');

    xr.endSession();

    expect(xr.setAnimationLoop).toHaveBeenLastCalledWith(null);
    expect(requestAnimationFrameSpy).toHaveBeenCalledTimes(1);
  });

  test('stops listening to session events when disposed', () => {
    viewer.dispose();

    xr.startSession();

    expect(xr.setAnimationLoop).not.toHaveBeenCalled();
  });

  test('clears the XR frame loop when disposed while presenting', () => {
    xr.startSession();

    viewer.dispose();

    expect(xr.setAnimationLoop).toHaveBeenLastCalledWith(null);
  });

  test('skips frames without a viewer pose', () => {
    xr.startSession();

    getXRFrameLoop()(16, untrackedFrame);

    expect(renderViews).not.toHaveBeenCalled();
  });

  test('an exception in a frame does not escape the XR frame loop', () => {
    viewer.on('beforeSceneRendered', () => {
      throw new Error('handler failed');
    });
    xr.startSession();
    const loop = getXRFrameLoop();

    expect(() => loop(16, trackedFrame)).not.toThrow();
  });

  test('keeps rendering after a frame threw', () => {
    let shouldThrow = true;
    viewer.on('beforeSceneRendered', () => {
      if (shouldThrow) throw new Error('handler failed');
    });
    xr.startSession();
    const loop = getXRFrameLoop();
    loop(16, trackedFrame);

    shouldThrow = false;
    loop(32, trackedFrame);

    expect(renderViews).toHaveBeenCalledTimes(1);
  });

  test('starts rendering in XR when created while a session is already active', () => {
    viewer.dispose();
    xr.isPresenting = true;
    xr.setAnimationLoop.mockClear();

    viewer = new Cognite3DViewer({ sdk, renderer, _sectorCuller, logMetrics: false });

    expect(xr.setAnimationLoop).toHaveBeenCalledWith(expect.any(Function));
  });

  test('turns off xr.enabled during the session and restores it afterwards', () => {
    xr.enabled = true;

    xr.startSession();
    expect(xr.enabled).toBe(false);

    xr.endSession();
    expect(xr.enabled).toBe(true);
  });

  test('does not end a session on an app-provided renderer when disposed', () => {
    xr.startSession();

    viewer.dispose();

    expect(xr.session.end).not.toHaveBeenCalled();
  });

  test('getScreenshot() is not supported while presenting', async () => {
    xr.startSession();

    await expect(viewer.getScreenshot()).rejects.toThrow('WebXR');
  });

  describe('getIntersectionFromRay', () => {
    test('picks along the ray with a camera looking down it', async () => {
      const internals = viewer as unknown as ViewerInternals;
      const intersectCadNodes = vi.fn<ViewerInternals['_pickingHandler']['intersectCadNodes']>(async () => []);
      internals._pickingHandler.intersectCadNodes = intersectCadNodes;
      internals._pointCloudPickingHandler.intersectPointClouds = vi.fn(async () => []);
      const ray = new Ray(new Vector3(1, 2, 3), new Vector3(0, -1, 0));

      const result = await viewer.getIntersectionFromRay(ray, 50);

      expect(result).toBeNull();
      const input = intersectCadNodes.mock.calls[0][1] as IntersectInput;
      expect(input.normalizedCoords).toEqual(new Vector2(0, 0));
      expect(input.camera.position.toArray()).toEqual([1, 2, 3]);
      expect(input.camera.getWorldDirection(new Vector3()).distanceTo(ray.direction)).toBeLessThan(1e-6);
      expect(input.camera.far).toBe(50);
    });

    test('returns null without picking when the scene is empty and no max distance is given', async () => {
      const internals = viewer as unknown as ViewerInternals;
      const intersectCadNodes = vi.fn(async () => []);
      internals._pickingHandler.intersectCadNodes = intersectCadNodes;

      const result = await viewer.getIntersectionFromRay(new Ray(new Vector3(), new Vector3(0, 0, -1)));

      expect(result).toBeNull();
      expect(intersectCadNodes).not.toHaveBeenCalled();
    });
  });
});
