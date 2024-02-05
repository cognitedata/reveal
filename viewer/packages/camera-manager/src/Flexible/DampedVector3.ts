/*!
 * Copyright 2024 Cognite AS
 */

import { Vector3 } from 'three';
import { lerp } from 'three/src/math/MathUtils';

export class DampedVector3 {
  public readonly value = new Vector3();
  public readonly end = new Vector3();

  // Used as a temporary variable to avoid creating new objects
  private readonly _valueVector = new Vector3();
  private readonly _endVector = new Vector3();

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
    const endVector = this._endVector.subVectors(this.end, center.end);
    const valueVector = this._valueVector.subVectors(this.value, center.value);

    const endLength = endVector.length();
    const valueLength = valueVector.length();

    endVector.normalize();
    valueVector.normalize();

    // Lerp vector
    valueVector.lerp(endVector, dampeningFactor);

    // Lerp vector length
    valueVector.normalize();
    const length = lerp(valueLength, endLength, dampeningFactor);
    valueVector.multiplyScalar(length);

    // Damp the center
    center.damp(dampeningFactor);

    // Set the new value
    this.value.copy(valueVector.add(center.value));
  }
}
