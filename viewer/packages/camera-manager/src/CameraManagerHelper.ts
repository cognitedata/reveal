/*!
 * Copyright 2022 Cognite AS
 */

import { CameraFarBuffers, NearAndFarPlaneBuffers } from '@reveal/camera-manager';
import { Box3, PerspectiveCamera, Plane, Quaternion, Vector3 } from 'three';
import range from 'lodash/range';
import { fitCameraToBoundingBox } from '@reveal/utilities';

/**
 * Helper methods for implementing a camera manager.
 */
export class CameraManagerHelper {
  /**
   * @deprecated usage of mutable static variables is unsafe
   * Reusable buffers used by updateNearAndFarPlane function to avoid allocations.
   */
  private static readonly _updateNearAndFarPlaneBuffers = {
    cameraPosition: new Vector3(),
    cameraDirection: new Vector3(),
    corners: new Array<Vector3>(
      new Vector3(),
      new Vector3(),
      new Vector3(),
      new Vector3(),
      new Vector3(),
      new Vector3(),
      new Vector3(),
      new Vector3()
    )
  };

  /**
   * @deprecated usage of mutable static variables is unsafe
   * @private
   */
  private static readonly _calculateCameraFarBuffers = {
    nearPlaneCoplanarPoint: new Vector3(),
    nearPlane: new Plane()
  };

  private readonly _instanceUpdateNearAndFarPlaneBuffers = {
    cameraPosition: new Vector3(),
    cameraDirection: new Vector3(),
    corners: new Array<Vector3>(
      new Vector3(),
      new Vector3(),
      new Vector3(),
      new Vector3(),
      new Vector3(),
      new Vector3(),
      new Vector3(),
      new Vector3()
    )
  };

  private readonly _instanceCalculateCameraFarBuffers = {
    nearPlaneCoplanarPoint: new Vector3(),
    nearPlane: new Plane()
  };

  /**
   * Calculates camera target based on new camera rotation.
   * @param camera Used camera instance.
   * @param rotation New camera rotation in quaternion form.
   * @param currentTarget Current camera target.
   * @param position New camera position.
   * @returns
   */
  static calculateNewTargetFromRotation(
    camera: PerspectiveCamera,
    rotation: Quaternion,
    currentTarget: Vector3,
    position: Vector3
  ): Vector3 {
    const distToTarget = currentTarget.clone().sub(camera.position);
    const tempCam = camera.clone();

    tempCam.setRotationFromQuaternion(rotation);
    tempCam.updateMatrix();

    const newTarget = tempCam
      .getWorldDirection(new Vector3())
      .normalize()
      .multiplyScalar(distToTarget.length())
      .add(position);

    return newTarget;
  }

  /**
   * Calculates camera rotation from target
   * @param camera Used Camera instance
   * @param newTarget The target to compute rotation from
   * @returns New camera rotationg
   */
  static calculateNewRotationFromTarget(camera: PerspectiveCamera, newTarget: Vector3): Quaternion {
    const cameraClone = camera.clone();
    cameraClone.lookAt(newTarget);
    return new Quaternion().setFromEuler(cameraClone.rotation);
  }
  /**
   * Updates near and far plane of the camera based on the bounding box.
   * @param camera Used camera instance.
   * @param boundingBox Bounding box of all objects on the scene.
   * @param nearAndFarPlaneBuffers to read from
   * @param cameraFarBuffers
   */
  static updateCameraNearAndFar(
    camera: PerspectiveCamera,
    boundingBox: Box3,
    nearAndFarPlaneBuffers: NearAndFarPlaneBuffers = CameraManagerHelper._updateNearAndFarPlaneBuffers,
    cameraFarBuffers: CameraFarBuffers = CameraManagerHelper._calculateCameraFarBuffers
  ): void {
    const { cameraPosition, cameraDirection, corners } = nearAndFarPlaneBuffers;
    this.getBoundingBoxCorners(boundingBox, corners);
    camera.getWorldPosition(cameraPosition);
    camera.getWorldDirection(cameraDirection);

    // 1. Compute nearest to fit the whole boundingBox (the case
    // where the camera is inside the box is ignored for now)
    let near = this.calculateCameraNear(camera, boundingBox, cameraPosition);

    // 2. Compute the far distance to the distance from camera to furthest
    // corner of the bounding box that is "in front" of the near plane
    const far = this.calculateCameraFar(near, cameraPosition, cameraDirection, corners, cameraFarBuffers);

    // 3. Handle when camera is inside the model by adjusting the near value
    if (boundingBox.containsPoint(cameraPosition)) {
      near = Math.min(0.1, far / 1000.0);
    }

    camera.near = near;
    camera.far = far;
    camera.updateProjectionMatrix();
  }

  public updateCameraNearAndFar(camera: PerspectiveCamera, boundingBox: Box3): void {
    CameraManagerHelper.updateCameraNearAndFar(
      camera,
      boundingBox,
      this._instanceUpdateNearAndFarPlaneBuffers,
      this._instanceCalculateCameraFarBuffers
    );
  }

  /**
   * Calculates camera position and target that allows to see the content of provided bounding box.
   * @param camera Used camera instance.
   * @param boundingBox Bounding box to be fitted.
   * @param radiusFactor The ratio of the distance from camera to center of box and radius of the box.
   * @returns
   */
  static calculateCameraStateToFitBoundingBox(
    camera: PerspectiveCamera,
    boundingBox: Box3,
    radiusFactor: number = 2
  ): { position: Vector3; target: Vector3 } {
    return fitCameraToBoundingBox(camera, boundingBox, radiusFactor);
  }

  private static calculateCameraFar(
    near: number,
    cameraPosition: Vector3,
    cameraDirection: Vector3,
    corners: Array<Vector3>,
    cameraFarBuffers: CameraFarBuffers
  ): number {
    const { nearPlane, nearPlaneCoplanarPoint } = cameraFarBuffers;

    nearPlaneCoplanarPoint.copy(cameraPosition).addScaledVector(cameraDirection, near);
    nearPlane.setFromNormalAndCoplanarPoint(cameraDirection, nearPlaneCoplanarPoint);
    let far = -Infinity;
    for (let i = 0; i < corners.length; ++i) {
      if (nearPlane.distanceToPoint(corners[i]) >= 0) {
        const dist = corners[i].distanceTo(cameraPosition);
        far = Math.max(far, dist);
      }
    }
    return Math.max(near * 2, far);
  }

  private static calculateCameraNear(camera: PerspectiveCamera, boundingBox: Box3, cameraPosition: Vector3): number {
    let near = boundingBox.distanceToPoint(cameraPosition);
    near /= Math.sqrt(1 + Math.tan(((camera.fov / 180) * Math.PI) / 2) ** 2 * (camera.aspect ** 2 + 1));
    return Math.max(0.1, near);
  }

  private static getBoundingBoxCorners(boundingBox: Box3, outBuffer?: Vector3[]): Vector3[] {
    outBuffer = outBuffer || range(0, 8).map(_ => new Vector3());
    if (outBuffer.length !== 8) {
      throw new Error(`outBuffer must hold exactly 8 elements, but holds ${outBuffer.length} elemnents`);
    }

    const min = boundingBox.min;
    const max = boundingBox.max;
    outBuffer[0].set(min.x, min.y, min.z);
    outBuffer[1].set(max.x, min.y, min.z);
    outBuffer[2].set(min.x, max.y, min.z);
    outBuffer[3].set(min.x, min.y, max.z);
    outBuffer[4].set(max.x, max.y, min.z);
    outBuffer[5].set(max.x, max.y, max.z);
    outBuffer[6].set(max.x, min.y, max.z);
    outBuffer[7].set(min.x, max.y, max.z);
    return outBuffer;
  }
}
