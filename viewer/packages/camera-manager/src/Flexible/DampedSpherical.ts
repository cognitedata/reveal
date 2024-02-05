/*!
 * Copyright 2024 Cognite AS
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

  damp(dampeningFactor: number): void {
    DampedSpherical.dampSphericalVectors(this.value, this.end, dampeningFactor);
  }

  static dampSphericalVectors(value: Spherical, end: Spherical, dampeningFactor: number): void {
    const deltaPhi = end.phi - value.phi;
    const deltaTheta = getShortestDeltaTheta(end.theta, value.theta);
    const deltaRadius = end.radius - value.radius;

    value.phi += deltaPhi * dampeningFactor;
    value.theta += deltaTheta * dampeningFactor;
    value.radius += deltaRadius * dampeningFactor;
    value.makeSafe();
  }
}

function getShortestDeltaTheta(theta1: number, theta2: number) {
  const twoPi = 2 * Math.PI;
  const rawDeltaTheta = (theta1 % twoPi) - (theta2 % twoPi);

  let deltaTheta = Math.min(Math.abs(rawDeltaTheta), twoPi - Math.abs(rawDeltaTheta));
  const thetaSign = (deltaTheta === Math.abs(rawDeltaTheta) ? 1 : -1) * Math.sign(rawDeltaTheta);
  deltaTheta *= thetaSign;
  return deltaTheta;
}
