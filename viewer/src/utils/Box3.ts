/*!
 * Copyright 2020 Cognite AS
 */

import { vec3, mat4 } from 'gl-matrix';

export class Box3 {
  public readonly min: vec3;
  public readonly max: vec3;

  public get center(): vec3 {
    const result = vec3.create();
    const sum = vec3.add(result, this.min, this.max);
    return vec3.scale(result, sum, 0.5);
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

  get size(): vec3 {
    return vec3.subtract(vec3.create(), this.max, this.min);
  }

  createTransformed(matrix: mat4): Box3 {
    const pMin = vec3.transformMat4(vec3.create(), this.min, matrix);
    const pMax = vec3.transformMat4(vec3.create(), this.max, matrix);
    return new Box3([pMin, pMax]);
  }

  containsPoint(p: vec3): boolean {
    return (
      p[0] >= this.min[0] &&
      p[1] >= this.min[1] &&
      p[2] >= this.min[2] &&
      p[0] <= this.max[0] &&
      p[1] <= this.max[1] &&
      p[2] <= this.max[2]
    );
  }
}
