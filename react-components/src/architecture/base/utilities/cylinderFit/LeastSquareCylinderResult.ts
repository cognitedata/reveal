import { Matrix4, Quaternion, Vector3 } from 'three';

export const UP_VECTOR = new Vector3(0, 0, 1);

export class LeastSquareCylinderResult {
  public height: number;
  public radius: number;
  public readonly center: Vector3 = new Vector3();
  private readonly _axis: Vector3 = new Vector3(); // Will be normalized with Z >= 0

  public rms = 0; // Root mean square of the fit, 0 is perfect fit

  get axis(): Vector3 {
    return this._axis;
  }

  set axis(value: Vector3) {
    this._axis.copy(value);
    this._axis.normalize();
    if (this._axis.z < 0) {
      this._axis.negate();
    }
  }

  get centerA(): Vector3 {
    return this.center.clone().addScaledVector(this.axis, this.height / 2);
  }

  get centerB(): Vector3 {
    return this.center.clone().addScaledVector(this.axis, -this.height / 2);
  }

  constructor(center: Vector3, axis: Vector3, radius: number, height: number) {
    this.center.copy(center);
    this.axis = axis;
    this.radius = radius;
    this.height = height;
  }

  public getTranslationRotationMatrix(): Matrix4 {
    return getTranslationRotationMatrix(this.axis, this.center);
  }
}

export function getTranslationRotationMatrix(axis: Vector3, center: Vector3): Matrix4 {
  const quaternion = new Quaternion().setFromUnitVectors(UP_VECTOR, axis.clone().normalize());
  const matrix = new Matrix4().makeRotationFromQuaternion(quaternion);
  return matrix.setPosition(center);
}
