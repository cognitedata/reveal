/*!
 * Copyright 2021 Cognite AS
 */

import { Spherical, Vector3 } from 'three';

export class DampedSpherical {
  public readonly value = new Spherical();
  public readonly end = new Spherical();
  private readonly _vector = new Vector3();
  private readonly _vectorEnd = new Vector3();

  isChanged(epsilon: number): boolean {
    if (Math.abs(this.value.radius - this.end.radius) >= epsilon) return true;
    if (Math.abs(this.value.phi - this.end.phi) >= epsilon) return true;
    if (Math.abs(this.value.theta - this.end.theta) >= epsilon) return true;
    return false;
  }

  public getVector(): Vector3 {
    return this._vector.setFromSpherical(this.value);
  }

  public getVectorEnd(): Vector3 {
    return this._vectorEnd.setFromSpherical(this.end);
  }

  copy(value: Vector3): void {
    this.value.setFromVector3(value);
    this.value.radius = 1;
    this.value.makeSafe();
    this.synchronizeEnd();
  }

  synchronize(): void {
    this.end.makeSafe();
    this.value.copy(this.end);
  }

  synchronizeEnd(): void {
    this.end.copy(this.value);
  }

  damp(dampningFactor: number): void {
    const vector = this.getVector();
    const vectorEnd = this.getVectorEnd();
    const delta = vectorEnd.sub(vector);
    vector.addScaledVector(delta, dampningFactor);
    this.value.setFromVector3(vector);
    this.value.radius = 1;
    this.value.makeSafe();
  }
}
