/*!
 * Copyright 2026 Cognite AS
 */

import type { Box3, Matrix4 } from 'three';
import { MathUtils, PerspectiveCamera, Vector3, type WebGLRenderer } from 'three';
import type { RenderView } from '@reveal/rendering';

/** Near plane in meters. Small, so that geometry can be inspected up close. */
const XR_NEAR = 0.01;
/** How long the head and models must be still before geometry loading treats the camera as stopped. */
const MOTION_SETTLE_MS = 300;

/**
 * Derives Reveal cameras from the active WebXR session each frame:
 * one camera per view (eye) for rendering, and a camera covering all views for geometry loading.
 *
 * The XR reference space is used directly as Reveal's world space (in meters). Apps place content
 * with model transformations (e.g. `CogniteCadModel.setModelTransformation`).
 */
export class WebXRViews {
  private readonly _renderer: WebGLRenderer;
  /** Updated by three.js to the pose and combined projection of all views. */
  private readonly _headCamera = new PerspectiveCamera();
  private readonly _viewCameras: PerspectiveCamera[] = [];
  private readonly _views: RenderView[] = [];
  private readonly _loadingCamera = new PerspectiveCamera();

  private readonly _lastMotionSignature: number[] = [];
  private _lastMotionTime = 0;
  private _inMotion = false;

  constructor(renderer: WebGLRenderer) {
    this._renderer = renderer;
  }

  get headCamera(): PerspectiveCamera {
    return this._headCamera;
  }

  get views(): readonly RenderView[] {
    return this._views;
  }

  /**
   * Updates the head and view cameras from the current XR frame.
   * @param sceneBoundingBox Bounding box of everything rendered, used to fit the far plane.
   */
  update(sceneBoundingBox: Box3): void {
    const head = this._headCamera;
    head.near = XR_NEAR;
    head.far = computeFarPlane(head.position, sceneBoundingBox);
    this._renderer.xr.updateCamera(head);

    const xrViewCameras = this._renderer.xr.getCamera().cameras;
    this._views.length = xrViewCameras.length;
    xrViewCameras.forEach((xrViewCamera, index) => {
      const camera = (this._viewCameras[index] ??= createViewCamera());
      copyXRViewCamera(xrViewCamera, camera, head.near, head.far);
      this._views[index] = { camera, viewport: xrViewCamera.viewport! };
    });
  }

  /**
   * Camera covering all views, for geometry loading, and whether it should be considered moving.
   * The camera counts as moving when the head or any model transformation changes, since moving
   * a model relative to the viewer is equivalent to moving the camera.
   * @param modelTransformations Current transformations of all models.
   */
  getLoadingCamera(modelTransformations: readonly Matrix4[]): { camera: PerspectiveCamera; inMotion: boolean } {
    const head = this._headCamera;
    const camera = this._loadingCamera;
    camera.position.copy(head.position);
    camera.quaternion.copy(head.quaternion);
    camera.fov = head.fov;
    // three.js sets the head projection to the union of all view frustums.
    const projection = head.projectionMatrix.elements;
    camera.aspect = projection[0] !== 0 ? projection[5] / projection[0] : 1;
    camera.near = head.near;
    camera.far = head.far;
    camera.updateProjectionMatrix();
    camera.updateMatrixWorld(true);

    const signature = [...head.matrixWorld.elements, ...modelTransformations.flatMap(m => m.elements)];
    const now = performance.now();
    if (!signaturesNearlyEqual(signature, this._lastMotionSignature)) {
      this._lastMotionSignature.splice(0, Infinity, ...signature);
      this._lastMotionTime = now;
      this._inMotion = true;
    } else if (this._inMotion && now - this._lastMotionTime > MOTION_SETTLE_MS) {
      this._inMotion = false;
    }
    return { camera, inMotion: this._inMotion };
  }

  /** Forgets motion state from a previous session. */
  reset(): void {
    this._lastMotionSignature.length = 0;
    this._inMotion = false;
  }
}

function createViewCamera(): PerspectiveCamera {
  const camera = new PerspectiveCamera();
  // The matrices are copied from the XR view, so don't let three.js recompute them from position/rotation.
  camera.matrixAutoUpdate = false;
  camera.matrixWorldAutoUpdate = false;
  return camera;
}

function copyXRViewCamera(source: PerspectiveCamera, target: PerspectiveCamera, near: number, far: number): void {
  target.matrix.copy(source.matrixWorld);
  target.matrixWorld.copy(source.matrixWorld);
  target.matrixWorld.decompose(target.position, target.quaternion, target.scale);
  target.matrixWorldInverse.copy(source.matrixWorldInverse);
  target.projectionMatrix.copy(source.projectionMatrix);
  target.projectionMatrixInverse.copy(source.projectionMatrixInverse);
  target.near = near;
  target.far = far;
  // Approximations for code that reads these rather than the projection matrix.
  target.fov = MathUtils.radToDeg(2 * Math.atan(1 / source.projectionMatrix.elements[5]));
  if (source.viewport !== undefined) target.aspect = source.viewport.z / source.viewport.w;
}

const cornerHelper = new Vector3();

function computeFarPlane(position: Vector3, box: Box3): number {
  if (box.isEmpty()) return 1000;
  let maxDistanceSquared = 0;
  for (let i = 0; i < 8; i++) {
    cornerHelper.set(i & 1 ? box.max.x : box.min.x, i & 2 ? box.max.y : box.min.y, i & 4 ? box.max.z : box.min.z);
    maxDistanceSquared = Math.max(maxDistanceSquared, cornerHelper.distanceToSquared(position));
  }
  return Math.max(10, Math.sqrt(maxDistanceSquared) * 1.5);
}

function signaturesNearlyEqual(a: readonly number[], b: readonly number[], epsilon = 1e-4): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (Math.abs(a[i] - b[i]) > epsilon * Math.max(1, Math.abs(b[i]))) return false;
  }
  return true;
}
