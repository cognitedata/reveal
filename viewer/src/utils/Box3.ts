/*!
 * Copyright 2019 Cognite AS
 */

import { vec3 } from 'gl-matrix';

export class Box3 {
  public readonly min: vec3;
  public readonly max: vec3;

  public get center(): vec3 {
    return vec3.scaleAndAdd(vec3.create(), this.min, this.max, 0.5);
  }

  constructor(points: vec3[]) {
    this.min = vec3.fromValues(Infinity, Infinity, Infinity);
    this.max = vec3.fromValues(-Infinity, -Infinity, -Infinity);
    for (const p of points) {
      this.min[0] = Math.min(p[0], this.min[0]);
      this.min[1] = Math.min(p[1], this.min[1]);
      this.min[2] = Math.min(p[2], this.min[2]);
      this.max[0] = Math.max(p[0], this.max[0]);
      this.max[1] = Math.max(p[1], this.max[1]);
      this.max[2] = Math.max(p[2], this.max[2]);
    }
  }
}
