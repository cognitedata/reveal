/*!
 * Copyright 2024 Cognite AS
 */

import { Vector3 } from 'three';
import { Range1 } from '../../../base/utilities/geometry/Range1';
import { type RegularGrid2 } from './RegularGrid2';
import { isAbsEqual, isBetween } from '../../../base/utilities/extensions/mathExtensions';

export class ContouringService {
  // ==================================================
  // INSTANCE FIELDS
  // ==================================================

  private readonly _tempRange = new Range1();
  private readonly _increment: number;
  private readonly _tolerance: number;
  private readonly _positions: number[] = [];

  // ==================================================
  // CONSTRUCTOR
  // ==================================================

  public constructor(increment: number) {
    this._increment = increment;
    this._tolerance = this._increment / 1000;
  }

  // ==================================================
  // INSTANCE METHODS: Create functions
  // ==================================================

  public createContoursAsXyzArray(grid: RegularGrid2): number[] {
    const p0 = new Vector3();
    const p1 = new Vector3();
    const p2 = new Vector3();
    const p3 = new Vector3();

    for (let i = 0; i < grid.nodeSize.i - 1; i++) {
      for (let j = 0; j < grid.nodeSize.j - 1; j++) {
        const isDef0 = grid.getRelativeNodePosition(i + 0, j + 0, p0);
        const isDef1 = grid.getRelativeNodePosition(i + 1, j + 0, p1);
        const isDef2 = grid.getRelativeNodePosition(i + 1, j + 1, p2);
        const isDef3 = grid.getRelativeNodePosition(i + 0, j + 1, p3);

        let triangleCount = 0;
        if (isDef0) triangleCount += 1;
        if (isDef2) triangleCount += 1;
        if (isDef2) triangleCount += 1;
        if (isDef3) triangleCount += 1;

        if (triangleCount < 3) {
          continue;
        }
        // (i,j+1)     (i+1,j+1)
        //     3------2
        //     |      |
        //     0------1
        // (i,j)       (i+1,j)

        if (!isDef0) {
          this.addTriangle(p1, p2, p3);
        }
        if (triangleCount === 4 || !isDef1) {
          this.addTriangle(p0, p2, p3);
        }
        if (!isDef2) {
          this.addTriangle(p0, p1, p3);
        }
        if (triangleCount === 4 || !isDef3) {
          this.addTriangle(p0, p1, p2);
        }
      }
    }
    return this._positions;
  }

  // ==================================================
  // INSTANCE METHODS: Helpers
  // ==================================================

  private addTriangle(a: Vector3, b: Vector3, c: Vector3): void {
    this._tempRange.set(Math.min(a.z, b.z, c.z), Math.max(a.z, b.z, c.z));

    for (const anyTick of this._tempRange.getFastTicks(this._increment, this._tolerance)) {
      const z = Number(anyTick);
      this.addLevelAt(z, a, b, c);
    }
  }

  private addLevelAt(z: number, a: Vector3, b: Vector3, c: Vector3): boolean {
    // Make sure we don't run into numerical problems
    if (isAbsEqual(a.z, z, this._tolerance)) a.z = z + this._tolerance;
    if (isAbsEqual(b.z, z, this._tolerance)) b.z = z + this._tolerance;
    if (isAbsEqual(c.z, z, this._tolerance)) c.z = z + this._tolerance;
    if (isAbsEqual(a.z, b.z, this._tolerance)) b.z = a.z + this._tolerance;

    // Special cases, check exact intersection on the corner or along the edges
    if (a.z === z) {
      if (isBetween(b.z, z, c.z)) {
        this.add(a);
        this.addLinearInterpolation(b, c, z);
        return true;
      }
      if (b.z === z && c.z !== z) {
        this.add(a);
        this.add(b);
        return true;
      }
      if (c.z === z && b.z !== z) {
        this.add(c);
        this.add(a);
        return true;
      }
    }
    if (b.z === z) {
      if (isBetween(c.z, z, a.z)) {
        this.add(b);
        this.addLinearInterpolation(c, a, z);
        return true;
      }
      if (c.z === z && a.z !== z) {
        this.add(b);
        this.add(c);
        return true;
      }
    }
    if (c.z === z && isBetween(a.z, z, b.z)) {
      this.add(c);
      this.addLinearInterpolation(a, b, z);
      return true;
    }
    // Intersection of two of the edges
    let numPoints = 0;
    if (isBetween(a.z, z, b.z)) {
      this.addLinearInterpolation(a, b, z);
      numPoints += 1;
    }
    if (isBetween(b.z, z, c.z)) {
      if (numPoints === 0) this.addLinearInterpolation(b, c, z);
      else this.addLinearInterpolation(b, c, z);
      numPoints += 1;
    }
    if (numPoints < 2 && isBetween(c.z, z, a.z)) {
      if (numPoints === 0) this.addLinearInterpolation(c, a, z);
      else this.addLinearInterpolation(c, a, z);
      numPoints += 1;
    }
    if (numPoints === 2) {
      return true;
    }
    if (numPoints === 1) {
      // Remove the last added
      this._positions.pop();
      this._positions.pop();
      this._positions.pop();
    }
    return false;
  }

  private add(position: Vector3): void {
    this.addXyz(position.y, position.y, position.z);
  }

  private addLinearInterpolation(a: Vector3, b: Vector3, z: number): void {
    // Z is assumed to be on or between a.Z and b.Z, used by the function below
    // a.Z and b.Z is assumed to be different (Check by yourself)
    // Returns  a + (b-a)*(z-a.Z)/(b.Z-a.Z);  (unrolled code)
    const f = (z - a.z) / (b.z - a.z);
    this.addXyz((b.x - a.x) * f + a.x, (b.y - a.y) * f + a.y, z);
  }

  private addXyz(x: number, y: number, z: number): void {
    this._positions.push(x, y, z);
  }
}
