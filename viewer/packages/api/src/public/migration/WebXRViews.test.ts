/*!
 * Copyright 2026 Cognite AS
 */

import { Box3, MathUtils, Matrix4, PerspectiveCamera, Quaternion, Vector3, Vector4, type WebGLRenderer } from 'three';
import { vi } from 'vitest';
import { WebXRViews } from './WebXRViews';

/**
 * Minimal stand-in for three's WebXRManager: updateCamera() poses the given (head) camera and the per-eye
 * cameras, like three does from the XR viewer pose.
 */
class FakeXR {
  headPosition = new Vector3(0, 1.6, 0);
  readonly eyes: PerspectiveCamera[];
  readonly updateCamera = vi.fn((head: PerspectiveCamera) => this.poseCameras(head));

  constructor() {
    this.eyes = [-0.032, 0.032].map((offset, index) => {
      const eye = new PerspectiveCamera(90, 1, 0.1, 100);
      eye.position.set(offset, 0, 0);
      eye.viewport = new Vector4(index * 1000, 0, 1000, 800);
      return eye;
    });
  }

  getCamera() {
    return { cameras: this.eyes };
  }

  private poseCameras(head: PerspectiveCamera): void {
    head.position.copy(this.headPosition);
    head.updateMatrixWorld(true);
    // three sets the head projection to the union of the eye frustums and derives fov from it.
    // Off-center union of the eye frustums: tangents left 1.2, right 1.0, top/bottom 0.8.
    const n = head.near;
    head.projectionMatrix.makePerspective(-1.2 * n, 1.0 * n, 0.8 * n, -0.8 * n, n, head.far);
    head.fov = (360 / Math.PI) * Math.atan(1 / head.projectionMatrix.elements[5]);
    for (const [index, eye] of this.eyes.entries()) {
      eye.position.set(this.headPosition.x + (index === 0 ? -0.032 : 0.032), this.headPosition.y, this.headPosition.z);
      eye.updateMatrixWorld(true);
      eye.projectionMatrix.makePerspective(-1.0 * n, 0.8 * n, 0.8 * n, -0.8 * n, n, head.far);
      eye.projectionMatrixInverse.copy(eye.projectionMatrix).invert();
    }
  }
}

function createViews(): { views: WebXRViews; xr: FakeXR } {
  const xr = new FakeXR();
  const renderer = { xr } as unknown as WebGLRenderer;
  return { views: new WebXRViews(renderer), xr };
}

const sceneBox = new Box3(new Vector3(-1, 0, -3), new Vector3(1, 2, -1));

describe(WebXRViews.name, () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('creates one view per XR eye, with copied matrices and the eye viewport', () => {
    const { views, xr } = createViews();

    views.update(sceneBox);

    expect(views.views).toHaveLength(2);
    views.views.forEach((view, index) => {
      const eye = xr.eyes[index];
      expect(view.viewport).toBe(eye.viewport);
      expect(view.camera).not.toBe(eye);
      expect(view.camera.matrixWorld.equals(eye.matrixWorld)).toBe(true);
      expect(view.camera.matrixWorldInverse.equals(eye.matrixWorldInverse)).toBe(true);
      expect(view.camera.projectionMatrix.equals(eye.projectionMatrix)).toBe(true);
      expect(view.camera.position.toArray()).toEqual(eye.position.toArray());
    });
  });

  test('view cameras keep the XR matrices when three.js updates matrices before rendering', () => {
    const { views, xr } = createViews();
    views.update(sceneBox);
    const camera = views.views[0].camera;

    // WebGLRenderer.render() calls this for cameras without a parent, unless matrixWorldAutoUpdate is false.
    if (camera.matrixWorldAutoUpdate) camera.updateMatrixWorld();

    expect(camera.matrixWorld.equals(xr.eyes[0].matrixWorld)).toBe(true);
  });

  test('reuses view cameras between frames', () => {
    const { views } = createViews();
    views.update(sceneBox);
    const firstFrameCamera = views.views[0].camera;

    views.update(sceneBox);

    expect(views.views[0].camera).toBe(firstFrameCamera);
  });

  test('passes a small near plane and a far plane covering the scene to three.js', () => {
    const { views, xr } = createViews();
    views.update(sceneBox); // The far plane is fitted from the head position of the previous frame.
    views.update(sceneBox);

    const head = xr.updateCamera.mock.calls[1][0];
    const farthestCorner = new Vector3(-1, 0, -3).distanceTo(xr.headPosition);
    expect(head.near).toBe(0.01);
    expect(head.far).toBeGreaterThanOrEqual(farthestCorner);
    expect(views.views[0].camera.near).toBe(head.near);
    expect(views.views[0].camera.far).toBe(head.far);
  });

  test('far plane is a power of two, so small head movements do not change the depth range', () => {
    const { views, xr } = createViews();
    const box = new Box3(new Vector3(-50, 0, -100), new Vector3(50, 20, -40));
    views.update(box);
    views.update(box);
    const far = xr.updateCamera.mock.calls[1][0].far;

    xr.headPosition.x += 0.05;
    views.update(box);
    views.update(box);

    expect(Math.log2(far) % 1).toBe(0);
    expect(xr.updateCamera.mock.calls[3][0].far).toBe(far);
  });

  test('uses a default far plane for an empty scene and at least 16 m otherwise', () => {
    const { views, xr } = createViews();

    views.update(new Box3());
    expect(xr.updateCamera.mock.calls[0][0].far).toBe(1024);

    views.update(new Box3(new Vector3(0, 1.6, -0.1), new Vector3(0.1, 1.7, 0)));
    expect(xr.updateCamera.mock.calls[1][0].far).toBe(16);
  });

  test('raises the near plane for huge scenes to keep depth precision', () => {
    const { views, xr } = createViews();
    const hugeBox = new Box3(new Vector3(-1e5, 0, -1e5), new Vector3(1e5, 10, 1e5));

    views.update(hugeBox);

    const head = xr.updateCamera.mock.calls[0][0];
    expect(head.far / head.near).toBeLessThanOrEqual(1e5);
  });

  test('loading camera matches the head pose and covers the union frustum', () => {
    const { views } = createViews();
    views.update(sceneBox);
    const head = views.headCamera;

    const { camera } = views.getLoadingCamera([]);

    expect(camera.position.toArray()).toEqual(head.position.toArray());
    expect(camera.quaternion.equals(head.quaternion)).toBe(true);
    expect(camera.matrixWorld.equals(head.matrixWorld)).toBe(true);
    // The union frustum is off-center (FakeXR: tangents left 1.2, right 1.0, top/bottom 0.8). Geometry loading
    // rebuilds a symmetric projection from fov/aspect, which must contain all of it, plus a 25 degree margin.
    const verticalHalfAngle = MathUtils.degToRad(camera.fov / 2);
    const horizontalHalfAngle = Math.atan(Math.tan(verticalHalfAngle) * camera.aspect);
    const margin = MathUtils.degToRad(25);
    expect(verticalHalfAngle).toBeCloseTo(Math.atan(0.8) + margin);
    expect(horizontalHalfAngle).toBeCloseTo(Math.atan(1.2) + margin);
  });

  test('limits the loading frustum to less than 180 degrees', () => {
    const { views, xr } = createViews();
    xr.updateCamera.mockImplementation((head: PerspectiveCamera) => {
      head.position.copy(xr.headPosition);
      head.updateMatrixWorld(true);
      const n = head.near;
      head.projectionMatrix.makePerspective(-5 * n, 5 * n, 5 * n, -5 * n, n, head.far); // ~79 degree half-angles
    });
    views.update(sceneBox);

    const { camera } = views.getLoadingCamera([]);

    expect(camera.fov).toBeCloseTo(160);
    expect(Math.atan(Math.tan(MathUtils.degToRad(camera.fov / 2)) * camera.aspect)).toBeCloseTo(MathUtils.degToRad(80));
  });

  describe('motion', () => {
    let now: number;
    beforeEach(() => {
      now = 1000;
      vi.spyOn(performance, 'now').mockImplementation(() => now);
    });

    test('is in motion on the first frame and settles when nothing changes', () => {
      const { views } = createViews();
      views.update(sceneBox);

      expect(views.getLoadingCamera([]).inMotion).toBe(true);

      now += 100;
      expect(views.getLoadingCamera([]).inMotion).toBe(true);

      now += 300;
      expect(views.getLoadingCamera([]).inMotion).toBe(false);
    });

    test('head movement restarts motion', () => {
      const { views, xr } = createViews();
      views.update(sceneBox);
      views.getLoadingCamera([]);
      now += 1000;
      expect(views.getLoadingCamera([]).inMotion).toBe(false);

      xr.headPosition.x += 0.1;
      views.update(sceneBox);

      expect(views.getLoadingCamera([]).inMotion).toBe(true);
    });

    test('head tracking noise does not count as motion', () => {
      const { views, xr } = createViews();
      views.update(sceneBox);
      views.getLoadingCamera([]);
      now += 1000;
      views.getLoadingCamera([]);

      xr.headPosition.x += 0.0005;
      views.update(sceneBox);

      expect(views.getLoadingCamera([]).inMotion).toBe(false);
    });

    test('turning the head counts as motion', () => {
      const { views } = createViews();
      views.update(sceneBox);
      views.getLoadingCamera([]);
      now += 1000;
      expect(views.getLoadingCamera([]).inMotion).toBe(false);

      views.headCamera.quaternion.multiply(new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), 0.05));

      expect(views.getLoadingCamera([]).inMotion).toBe(true);
    });

    test('moving a model with a large translation (e.g. UTM coordinates) counts as motion', () => {
      const { views } = createViews();
      views.update(sceneBox);
      const modelTransformation = new Matrix4().makeTranslation(-6e5, 0, -6.5e6);
      views.getLoadingCamera([modelTransformation]);
      now += 1000;
      expect(views.getLoadingCamera([modelTransformation]).inMotion).toBe(false);

      modelTransformation.elements[12] += 1;

      expect(views.getLoadingCamera([modelTransformation]).inMotion).toBe(true);
    });

    test('changing a model transformation counts as motion', () => {
      const { views } = createViews();
      views.update(sceneBox);
      const modelTransformation = new Matrix4();
      views.getLoadingCamera([modelTransformation]);
      now += 1000;
      expect(views.getLoadingCamera([modelTransformation]).inMotion).toBe(false);

      modelTransformation.makeTranslation(0, 0, -1);

      expect(views.getLoadingCamera([modelTransformation]).inMotion).toBe(true);
    });

    test('adding a model counts as motion', () => {
      const { views } = createViews();
      views.update(sceneBox);
      views.getLoadingCamera([]);
      now += 1000;
      expect(views.getLoadingCamera([]).inMotion).toBe(false);

      expect(views.getLoadingCamera([new Matrix4()]).inMotion).toBe(true);
    });

    test('reset() forgets the previous pose', () => {
      const { views } = createViews();
      views.update(sceneBox);
      views.getLoadingCamera([]);
      now += 1000;
      expect(views.getLoadingCamera([]).inMotion).toBe(false);

      views.reset();

      expect(views.getLoadingCamera([]).inMotion).toBe(true);
    });
  });
});
