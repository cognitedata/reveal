/*!
 * Copyright 2024 Cognite AS
 */

import { Spherical, Vector3 } from 'three';
import { DampedSpherical } from './DampedSpherical';

export class DampedVector3 {
  public readonly value = new Vector3();
  public readonly end = new Vector3();

  // Used as a temporary variable to avoid creating new objects
  private readonly _valueVector = new Vector3();
  private readonly _endVector = new Vector3();
  private readonly _valueSpherical = new Spherical();
  private readonly _endSpherical = new Spherical();

  isChanged(epsilon: number): boolean {
    if (Math.abs(this.value.x - this.end.x) >= epsilon) return true;
    if (Math.abs(this.value.y - this.end.y) >= epsilon) return true;
    if (Math.abs(this.value.z - this.end.z) >= epsilon) return true;
    return false;
  }

  clear(): void {
    this.value.set(0, 0, 0);
    this.end.set(0, 0, 0);
  }

  copy(value: Vector3): void {
    this.value.copy(value);
    this.end.copy(value);
  }

  add(other: DampedVector3): void {
    this.value.add(other.value);
    this.end.add(other.end);
  }

  synchronize(): void {
    this.value.copy(this.end);
  }

  synchronizeEnd(): void {
    this.end.copy(this.value);
  }

  damp(dampeningFactor: number): void {
    this.value.lerp(this.end, dampeningFactor);
  }

  /**
   * Suppose this(DampedVector3) is the position that orbits around the center point (DampedVector3). This has to be damped as a vector
   * instead of a point. It is used when the camera is orbiting around a center point.
   * This function also damp the center, since it is dependend on the center damped position
   * **/
  dampAsVectorAndCenter(dampeningFactor: number, center: DampedVector3): void {
    // Vector = Value - Center
    const valueVector = this._valueVector.subVectors(this.value, center.value);
    const endVector = this._endVector.subVectors(this.end, center.end);
    const value = this._endSpherical.setFromVector3(valueVector);
    const end = this._valueSpherical.setFromVector3(endVector);

    DampedSpherical.dampSphericalVectors(value, end, dampeningFactor);

    // Damp the center, center.value is then updated
    center.damp(dampeningFactor);

    // Set the new value on this by Value = Vector + center.value
    valueVector.setFromSpherical(value);
    this.value.copy(valueVector.add(center.value));
  }
}
