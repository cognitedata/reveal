/*!
 * Copyright 2024 Cognite AS
 */

import { getHorizontalCrossProduct, horizontalDistanceTo } from '../extensions/vectorExtensions';
import { Points } from './Points';
import { type Shape } from './Shape';
import { Vector3 } from 'three';

export class Polyline extends Points {
  // ==================================================
  // INSTANCE FIELDS
  // ==================================================

  public isClosed: boolean = false;

  // ==================================================
  // OVERRIDES of Shape:
  // ==================================================

  public override clone(): Shape {
    const result = new Polyline();
    result.list = [...this.list];
    return result;
  }

  // ==================================================
  // INSTANCE METHODS: Getters
  // ==================================================

  public getLength(dimension: number = 3): number {
    let length = 0;
    const maxIndex = this.list.length - 1;
    for (let i = 1; i <= maxIndex; i++) {
      const p0 = this.list[i - 1];
      const p1 = this.list[i];
      length += dimension === 3 ? p0.distanceTo(p1) : horizontalDistanceTo(p0, p1);
    }
    if (this.isClosed) {
      const p0 = this.list[maxIndex];
      const p1 = this.list[0];
      length += dimension === 3 ? p0.distanceTo(p1) : horizontalDistanceTo(p0, p1);
    }
    return length;
  }

  public getArea(): number {
    return Math.abs(this.getSignedArea());
  }

  public getSignedArea(): number {
    const n = this.length;
    if (n === 2) {
      return 0;
    }
    let area = 0;
    const first = this.list[0];
    const p0 = new Vector3();
    const p1 = new Vector3();

    for (let index = 1; index <= n; index++) {
      p1.copy(this.list[index % n]);
      p1.sub(first); // Translate down to first point, to increase acceracy
      area += getHorizontalCrossProduct(p0, p1);
      p0.copy(p1);
    }
    return area * 0.5;
  }
}
