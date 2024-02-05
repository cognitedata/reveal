/*!
 * Copyright 2021 Cognite AS
 */

import { Spherical, Vector3 } from 'three';

export class DampedSpherical {
  public readonly value = new Spherical();
  public readonly end = new Spherical();

  // Used as a temporary variable to avoid creating new objects
  private readonly _valueVector = new Vector3();
  private readonly _endVector = new Vector3();

  isChanged(epsilon: number): boolean {
    if (Math.abs(this.value.radius - this.end.radius) >= epsilon) return true;
    if (Math.abs(this.value.phi - this.end.phi) >= epsilon) return true;
    if (Math.abs(this.value.theta - this.end.theta) >= epsilon) return true;
    return false;
  }

  public getValueVector(): Vector3 {
    return this._valueVector.setFromSpherical(this.value);
  }

  public getEndVector(): Vector3 {
    return this._endVector.setFromSpherical(this.end);
  }

  public setValueVector(vector: Vector3): void {
    this.value.setFromVector3(vector);
    this.value.radius = 1;
    this.value.makeSafe();
  }

  public setEndVector(vector: Vector3): void {
    this.end.setFromVector3(vector);
    this.end.radius = 1;
    this.end.makeSafe();
  }

  copy(vector: Vector3): void {
    this.setValueVector(vector);
    this.synchronizeEnd();
  }

  synchronize(): void {
    this.value.copy(this.end);
  }

  synchronizeEnd(): void {
    this.end.copy(this.value);
  }

  damp(dampningFactor: number): void {
    const valueVector = this.getValueVector();
    const endVector = this.getEndVector();
    valueVector.lerp(endVector, dampningFactor);
    this.setValueVector(valueVector);
  }
}
