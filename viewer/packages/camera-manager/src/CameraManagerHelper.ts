/*!
 * Copyright 2022 Cognite AS
 */

import * as THREE from 'three';
import range from 'lodash/range';

/**
 * Helper methods for implementing a camera manager.
 */
export class CameraManagerHelper {
  /**
   * Reusable buffers used by updateNearAndFarPlane function to avoid allocations.
   */
  private static readonly _updateNearAndFarPlaneBuffers = {
    cameraPosition: new THREE.Vector3(),
    cameraDirection: new THREE.Vector3(),
    corners: new Array<THREE.Vector3>(
      new THREE.Vector3(),
      new THREE.Vector3(),
      new THREE.Vector3(),
      new THREE.Vector3(),
      new THREE.Vector3(),
      new THREE.Vector3(),
      new THREE.Vector3(),
      new THREE.Vector3()
    )
  };

  private static readonly _calculateCameraFarBuffers = {
    nearPlaneCoplanarPoint: new THREE.Vector3(),
    nearPlane: new THREE.Plane()
  };
  /**
   * Calculates camera target based on new camera rotation.
   * @param camera Used camera instance.
   * @param rotation New camera rotation in quaternion form.
   * @param currentTarget Current camera target.
   * @returns
   */
  static calculateNewTargetFromRotation(
    camera: THREE.PerspectiveCamera,
    rotation: THREE.Quaternion,
    currentTarget: THREE.Vector3
  ): THREE.Vector3 {
    const distToTarget = currentTarget.clone().sub(camera.position);
    const tempCam = camera.clone();

    tempCam.setRotationFromQuaternion(rotation);
    tempCam.updateMatrix();

    const newTarget = tempCam
      .getWorldDirection(new THREE.Vector3())
      .normalize()
      .multiplyScalar(distToTarget.length())
      .add(tempCam.position);

    return newTarget;
  }
  /**
   * Updates near and far plane of the camera based on the bounding box.
   * @param camera Used camera instance.
   * @param combinedBbox Bounding box of all objects on the scene.
   */
  static updateCameraNearAndFar(camera: THREE.PerspectiveCamera, combinedBbox: THREE.Box3): void {
    const { cameraPosition, cameraDirection, corners } = this._updateNearAndFarPlaneBuffers;
    this.getBoundingBoxCorners(combinedBbox, corners);
    camera.getWorldPosition(cameraPosition);
    camera.getWorldDirection(cameraDirection);

    // 1. Compute nearest to fit the whole bbox (the case
    // where the camera is inside the box is ignored for now)
    let near = this.calculateCameraNear(camera, combinedBbox, cameraPosition);

    // 2. Compute the far distance to the distance from camera to furthest
    // corner of the boundingbox that is "in front" of the near plane
    const far = this.calculateCameraFar(near, cameraPosition, cameraDirection, corners);

    // 3. Handle when camera is inside the model by adjusting the near value
    if (combinedBbox.containsPoint(cameraPosition)) {
      near = Math.min(0.1, far / 1000.0);
    }

    camera.near = near;
    camera.far = far;
    camera.updateProjectionMatrix();
  }
  /**
   * Calculates camera position and target that allows to see the content of provided bounding box.
   * @param camera Used camera instance.
   * @param box Bounding box to be fitted.
   * @param radiusFactor The ratio of the distance from camera to center of box and radius of the box.
   * @returns
   */
  static calculateCameraStateToFitBoundingBox(
    camera: THREE.PerspectiveCamera,
    box: THREE.Box3,
    radiusFactor: number = 2
  ): { position: THREE.Vector3; target: THREE.Vector3 } {
    const boundingSphere = box.getBoundingSphere(new THREE.Sphere());

    const target = boundingSphere.center;
    const distance = boundingSphere.radius * radiusFactor;
    const direction = new THREE.Vector3(0, 0, -1);
    direction.applyQuaternion(camera.quaternion);

    const position = direction.clone().multiplyScalar(-distance).add(target);

    return { position, target };
  }

  private static calculateCameraFar(
    near: number,
    cameraPosition: THREE.Vector3,
    cameraDirection: THREE.Vector3,
    corners: Array<THREE.Vector3>
  ): number {
    const { nearPlane, nearPlaneCoplanarPoint } = this._calculateCameraFarBuffers;

    nearPlaneCoplanarPoint.copy(cameraPosition).addScaledVector(cameraDirection, near);
    nearPlane.setFromNormalAndCoplanarPoint(cameraDirection, nearPlaneCoplanarPoint);
    let far = -Infinity;
    for (let i = 0; i < corners.length; ++i) {
      if (nearPlane.distanceToPoint(corners[i]) >= 0) {
        const dist = corners[i].distanceTo(cameraPosition);
        far = Math.max(far, dist);
      }
    }
    far = Math.max(near * 2, far);

    return far;
  }

  private static calculateCameraNear(
    camera: THREE.PerspectiveCamera,
    combinedBbox: THREE.Box3,
    cameraPosition: THREE.Vector3
  ): number {
    let near = combinedBbox.distanceToPoint(cameraPosition);
    near /= Math.sqrt(1 + Math.tan(((camera.fov / 180) * Math.PI) / 2) ** 2 * (camera.aspect ** 2 + 1));
    near = Math.max(0.1, near);

    return near;
  }

  private static getBoundingBoxCorners(bbox: THREE.Box3, outBuffer?: THREE.Vector3[]): THREE.Vector3[] {
    outBuffer = outBuffer || range(0, 8).map(_ => new THREE.Vector3());
    if (outBuffer.length !== 8) {
      throw new Error(`outBuffer must hold exactly 8 elements, but holds ${outBuffer.length} elemnents`);
    }

    const min = bbox.min;
    const max = bbox.max;
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
