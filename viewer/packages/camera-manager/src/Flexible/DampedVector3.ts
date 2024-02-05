/*!
 * Copyright 2021 Cognite AS
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

  damp(dampningFactor: number): void {
    this.value.lerp(this.end, dampningFactor);
  }

  dampAsVectorAndCenter(dampningFactor: number, center: DampedVector3): void {
    // Vector = Value - Center
    const endVector = this._endVector.subVectors(this.end, center.end);
    const valueVector = this._valueVector.subVectors(this.value, center.value);

    const endLength = endVector.length();
    const valueLength = valueVector.length();

    endVector.normalize();
    valueVector.normalize();

    // Lerp vector
    valueVector.lerp(endVector, dampningFactor);

    // Lerp vector lenght
    valueVector.normalize();
    const length = lerp(valueLength, endLength, dampningFactor);
    valueVector.multiplyScalar(length);

    // Set the new value
    this.value.copy(valueVector.add(center.value));

    // Damp the center
    center.damp(dampningFactor);
  }
}
