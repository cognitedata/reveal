/*!
 * Copyright 2026 Cognite AS
 */

import type { Box3, WebGLRenderer } from 'three';
import { MathUtils, Matrix4, PerspectiveCamera, Quaternion, Vector2, Vector3 } from 'three';
import type { RenderView } from '@reveal/rendering';

/** Smallest near plane in meters, so that geometry can be inspected up close. */
const XR_MIN_NEAR = 0.01;
/** Largest far/near ratio. Beyond this the depth buffer can't resolve nearby surfaces (z-fighting). */
const XR_MAX_DEPTH_RATIO = 1e5;
const XR_MIN_FAR = 16;
const XR_DEFAULT_FAR = 1024;
/**
 * Geometry is loaded for this much more than the visible field of view on every side, so turning the head
 * shows already loaded geometry instead of empty space while loading catches up.
 */
const LOADING_FOV_MARGIN_RAD = MathUtils.degToRad(25);
const LOADING_MAX_HALF_ANGLE_RAD = MathUtils.degToRad(80);
/** How long the head and models must be still before geometry loading treats the camera as stopped. */
const MOTION_SETTLE_MS = 300;
/** Head movement below these is treated as tracking noise. */
const HEAD_MOTION_THRESHOLD_M = 0.002;
const HEAD_ROTATION_THRESHOLD_RAD = MathUtils.degToRad(0.2);
/** Model transformation changes below these are ignored (translation in world units, linear part relative). */
const MODEL_TRANSLATION_THRESHOLD = 0.001;
const MODEL_LINEAR_RELATIVE_THRESHOLD = 1e-4;

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
  private readonly _views: RenderView[] = [];
  private readonly _viewSize = new Vector2(1, 1);
  private readonly _loadingCamera = new PerspectiveCamera();

  private readonly _lastHeadPosition = new Vector3();
  private readonly _lastHeadQuaternion = new Quaternion();
  private readonly _lastModelTransformations: Matrix4[] = [];
  private _hasLastState = false;
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

  /** Size in pixels of the first view, which all views share on current devices. */
  get viewSize(): Vector2 {
    return this._viewSize;
  }

  /**
   * Updates the head and view cameras from the current XR frame.
   * @param sceneBoundingBox Bounding box of everything rendered, used to fit the near and far planes.
   */
  update(sceneBoundingBox: Box3): void {
    const head = this._headCamera;
    // Quantized so the session's depth range (which three.js updates whenever these change) rarely changes.
    head.far = computeFarPlane(head.position, sceneBoundingBox);
    head.near = Math.max(XR_MIN_NEAR, head.far / XR_MAX_DEPTH_RATIO);
    this._renderer.xr.updateCamera(head);

    const xrViewCameras = this._renderer.xr.getCamera().cameras;
    this._views.length = xrViewCameras.length;
    xrViewCameras.forEach((xrViewCamera, index) => {
      const view = (this._views[index] ??= { camera: createViewCamera(), viewport: xrViewCamera.viewport! });
      copyXRViewCamera(xrViewCamera, view.camera, head.near, head.far);
      view.viewport = xrViewCamera.viewport!;
    });
    if (this._views.length > 0) {
      this._viewSize.set(this._views[0].viewport.z, this._views[0].viewport.w);
    }
  }

  /**
   * Camera covering all views, for geometry loading, and whether it should be considered moving.
   * The camera counts as moving when the head or any model transformation changes, since moving
   * a model relative to the viewer is equivalent to moving the camera.
   * @param modelTransformations Current transformations of all models.
   * @returns The loading camera and whether it's moving.
   */
  getLoadingCamera(modelTransformations: readonly Matrix4[]): { camera: PerspectiveCamera; inMotion: boolean } {
    const head = this._headCamera;
    const camera = this._loadingCamera;
    camera.position.copy(head.position);
    camera.quaternion.copy(head.quaternion);
    // Geometry loading rebuilds the projection from fov/aspect, i.e. a symmetric frustum. The union of the
    // view frustums is off-center, so use a symmetric frustum that contains it, plus a margin.
    const { verticalHalfAngle, horizontalHalfTangent } = computeSymmetricBounds(head.projectionMatrix);
    const loadingVerticalHalfAngle = Math.min(verticalHalfAngle + LOADING_FOV_MARGIN_RAD, LOADING_MAX_HALF_ANGLE_RAD);
    const loadingHorizontalHalfAngle = Math.min(
      Math.atan(horizontalHalfTangent) + LOADING_FOV_MARGIN_RAD,
      LOADING_MAX_HALF_ANGLE_RAD
    );
    camera.fov = MathUtils.radToDeg(2 * loadingVerticalHalfAngle);
    camera.aspect = Math.tan(loadingHorizontalHalfAngle) / Math.tan(loadingVerticalHalfAngle);
    camera.near = head.near;
    camera.far = head.far;
    camera.updateProjectionMatrix();
    camera.updateMatrixWorld(true);

    const now = performance.now();
    if (this.hasMoved(head, modelTransformations)) {
      this._lastMotionTime = now;
      this._inMotion = true;
    } else if (this._inMotion && now - this._lastMotionTime > MOTION_SETTLE_MS) {
      this._inMotion = false;
    }
    return { camera, inMotion: this._inMotion };
  }

  /** Forgets motion state from a previous session. */
  reset(): void {
    this._hasLastState = false;
    this._inMotion = false;
  }

  private hasMoved(head: PerspectiveCamera, modelTransformations: readonly Matrix4[]): boolean {
    const lastModels = this._lastModelTransformations;
    const moved =
      !this._hasLastState ||
      head.position.distanceTo(this._lastHeadPosition) > HEAD_MOTION_THRESHOLD_M ||
      head.quaternion.angleTo(this._lastHeadQuaternion) > HEAD_ROTATION_THRESHOLD_RAD ||
      modelTransformations.length !== lastModels.length ||
      modelTransformations.some((transformation, index) => transformationChanged(transformation, lastModels[index]));

    if (moved) {
      this._hasLastState = true;
      this._lastHeadPosition.copy(head.position);
      this._lastHeadQuaternion.copy(head.quaternion);
      lastModels.length = modelTransformations.length;
      modelTransformations.forEach((transformation, index) =>
        (lastModels[index] ??= new Matrix4()).copy(transformation)
      );
    }
    return moved;
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

/**
 * Half-angles of the smallest symmetric frustum containing the (possibly off-center) perspective projection.
 * For a projection from `makePerspective(left, right, top, bottom, near, far)`:
 * elements[0] = 2n/(r-l), elements[8] = (r+l)/(r-l), elements[5] = 2n/(t-b), elements[9] = (t+b)/(t-b).
 * @param projection Perspective projection matrix.
 * @returns Vertical half-angle (radians) and the tangent of the horizontal half-angle.
 */
function computeSymmetricBounds(projection: Matrix4): { verticalHalfAngle: number; horizontalHalfTangent: number } {
  const e = projection.elements;
  const rightTangent = Math.abs((e[8] + 1) / e[0]);
  const leftTangent = Math.abs((e[8] - 1) / e[0]);
  const topTangent = Math.abs((e[9] + 1) / e[5]);
  const bottomTangent = Math.abs((e[9] - 1) / e[5]);
  return {
    verticalHalfAngle: Math.atan(Math.max(topTangent, bottomTangent)),
    horizontalHalfTangent: Math.max(rightTangent, leftTangent)
  };
}

const cornerHelper = new Vector3();

/**
 * Distance to the farthest corner of the box, rounded up to a power of two.
 * @param position Camera position.
 * @param box Scene bounding box.
 * @returns The far plane distance.
 */
function computeFarPlane(position: Vector3, box: Box3): number {
  if (box.isEmpty()) return XR_DEFAULT_FAR;
  let maxDistanceSquared = 0;
  for (let i = 0; i < 8; i++) {
    cornerHelper.set(i & 1 ? box.max.x : box.min.x, i & 2 ? box.max.y : box.min.y, i & 4 ? box.max.z : box.min.z);
    maxDistanceSquared = Math.max(maxDistanceSquared, cornerHelper.distanceToSquared(position));
  }
  const far = Math.sqrt(maxDistanceSquared) * 1.1;
  return Math.max(XR_MIN_FAR, 2 ** Math.ceil(Math.log2(Math.max(far, 1))));
}

/**
 * Whether a model transformation changed noticeably: translation by more than a millimeter (absolute, so large
 * offsets such as UTM coordinates don't hide motion), or the rotation/scale part relative to its scale.
 * @param current Current transformation.
 * @param last Transformation at the last detected motion.
 * @returns True if the transformation changed.
 */
function transformationChanged(current: Matrix4, last: Matrix4): boolean {
  const a = current.elements;
  const b = last.elements;
  for (let column = 0; column < 3; column++) {
    const scale = Math.max(Math.hypot(b[column * 4], b[column * 4 + 1], b[column * 4 + 2]), 1e-12);
    for (let row = 0; row < 4; row++) {
      const index = column * 4 + row;
      if (Math.abs(a[index] - b[index]) > MODEL_LINEAR_RELATIVE_THRESHOLD * scale) return true;
    }
  }
  return (
    Math.abs(a[12] - b[12]) > MODEL_TRANSLATION_THRESHOLD ||
    Math.abs(a[13] - b[13]) > MODEL_TRANSLATION_THRESHOLD ||
    Math.abs(a[14] - b[14]) > MODEL_TRANSLATION_THRESHOLD ||
    Math.abs(a[15] - b[15]) > 1e-9
  );
}
