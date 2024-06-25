/*!
 * Copyright 2024 Cognite AS
 */

import { Quaternion, Spherical, Vector3 } from 'three';
import { FlexibleControls } from './FlexibleControls';
import { FlexibleControlsType } from './FlexibleControlsType';

const UP_VECTOR = new Vector3(0, 1, 0);
const RIGHT_VECTOR = new Vector3(1, 0, 0);

/**
 * Helper class for rotating the camera. Call begin() before rotation,
 * and end() after so the camera position updates correcly
 * @beta
 */
export class FlexibleControlsRotationHelper {
  private readonly oldOffset: Vector3 = new Vector3();
  private readonly oldCameraVectorEnd: Spherical = new Spherical();

  public begin(controls: FlexibleControls): void {
    if (controls.isStationary) {
      return;
    }
    if (controls.controlsType === FlexibleControlsType.Orbit) {
      this.oldOffset.subVectors(controls.target.end, controls.cameraPosition.end);
      this.oldCameraVectorEnd.copy(controls.cameraVector.end);
    }
  }

  public end(controls: FlexibleControls): void {
    if (controls.isStationary) {
      return;
    }

    if (controls.controlsType === FlexibleControlsType.OrbitInCenter) {
      // Adust the camera position by
      // CameraPosition = Target - CameraVector * DistanceToTarget
      const distanceToTarget = controls.cameraPosition.end.distanceTo(controls.target.end);
      const cameraVector = controls.cameraVector.getEndVector();
      cameraVector.multiplyScalar(distanceToTarget);
      controls.cameraPosition.end.subVectors(controls.target.end, cameraVector);
    } else if (controls.controlsType === FlexibleControlsType.Orbit) {
      // Adust the camera position so the target point is the same on the screen
      const temp = new Quaternion();
      const oldQuat = new Quaternion()
        .setFromAxisAngle(UP_VECTOR, this.oldCameraVectorEnd.theta)
        .multiply(temp.setFromAxisAngle(RIGHT_VECTOR, this.oldCameraVectorEnd.phi));
      const newQuat = new Quaternion()
        .setFromAxisAngle(UP_VECTOR, controls.cameraVector.end.theta)
        .multiply(temp.setFromAxisAngle(RIGHT_VECTOR, controls.cameraVector.end.phi));

      const newOffset = this.oldOffset.applyQuaternion(oldQuat.conjugate()).applyQuaternion(newQuat);

      // CameraPosition = Target - Offset
      controls.cameraPosition.end.subVectors(controls.target.end, newOffset);
    }
  }
}
