/*!
 * Copyright 2024 Cognite AS
 */

import { Spherical, Vector3 } from 'three';

const MAX_VERICAL_COMPONTENT = 0.999;

export class DampedSpherical {
  public readonly value = new Spherical();
  public readonly end = new Spherical();

  // Used as a temporary variable to avoid creating new objects
  private readonly _valueVector = new Vector3();
  private readonly _endVector = new Vector3();

  public static isVertical(vector: Vector3): boolean {
    return Math.abs(vector.y / vector.length()) > MAX_VERICAL_COMPONTENT;
  }

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
    const oldTheta = this.value.theta;
    this.value.setFromVector3(vector);
    if (DampedSpherical.isVertical(vector)) {
      // If verical, keep the old theta, since the new value is arbitrarly
      this.value.theta = oldTheta;
    }
    this.value.radius = 1;
    this.value.makeSafe();
  }

  public setEndVector(vector: Vector3): void {
    const oldTheta = this.end.theta;
    this.end.setFromVector3(vector);
    if (DampedSpherical.isVertical(vector)) {
      // If verical, keep the old theta, since the new value is arbitrarly
      this.end.theta = oldTheta;
    }
    this.end.radius = 1;
    this.end.makeSafe();
  }

  setThetaFromVector(vector: Vector3): void {
    this.value.theta = new Spherical().setFromVector3(vector).theta;
    this.end.theta = this.value.theta;
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
