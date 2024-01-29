/*!
 * Copyright 2021 Cognite AS
 */

import { Vector3 } from 'three';

export class DampedVector3 {
  public readonly value = new Vector3();
  public readonly end = new Vector3();
  private readonly _delta = new Vector3();

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
    const delta = this._delta.subVectors(this.end, this.value);
    this.value.addScaledVector(delta, dampningFactor);
  }
}
