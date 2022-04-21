import { Rect } from '../types';

import { degToRad } from './utils';

export class Point {
  x: number;
  y: number;
  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  distance(other: Point) {
    return Math.sqrt((other.x - this.x) ** 2 + (this.y - other.y) ** 2);
  }

  lessThan(other: Point): number {
    const thisSum = this.x + this.y;
    const otherSum = other.x + other.y;

    if (thisSum < otherSum) {
      return -1;
    }
    if (thisSum > otherSum) {
      return 1;
    }

    if (this.y < other.y) {
      return -1;
    }
    if (this.y === other.y) {
      return 0;
    }
    return 1;
  }

  translate(x: number, y: number) {
    return new Point(this.x + x, this.y + y);
  }

  minus(other: Point) {
    return new Point(this.x - other.x, this.y - other.y);
  }

  average(other: Point) {
    return new Point((this.x + other.x) / 2, (this.y + other.y) / 2);
  }

  translateAndScale(
    translatePoint: Point,
    scale: number | Point,
    scaleOrigin: Point | undefined
  ) {
    let scaleX;
    let scaleY;
    if (scale instanceof Point) {
      scaleX = scale.x;
      scaleY = scale.y;
    } else {
      scaleX = scale;
      scaleY = scale;
    }

    const origin = scaleOrigin ?? new Point(0, 0);

    const newX = scaleX * (this.x + translatePoint.x - origin.x) + origin.x;
    const newY = scaleY * (this.y + translatePoint.y - origin.y) + origin.y;
    return new Point(newX, newY);
  }

  rotate(degAngle: number, pivotPoint: Point | undefined): Point {
    // based on: https://stackoverflow.com/a/2259502

    const radAngle = degToRad(degAngle);
    const s = Math.sin(radAngle);
    const c = Math.cos(radAngle);

    if (pivotPoint === undefined) {
      // Rotate around origo
      const newX = this.x * c - this.y * s;
      const newY = this.x * s + this.y * c;
      return new Point(newX, newY);
    }

    // translate as if pivot point is origin
    const translatedX = this.x - pivotPoint.x;
    const translatedY = this.y - pivotPoint.y;

    // rotate point
    const rotatedX = translatedX * c - translatedY * s;
    const rotatedY = translatedX * s + translatedY * c;

    // translate point back
    const newX = rotatedX + pivotPoint.x;
    const newY = rotatedY + pivotPoint.y;
    return new Point(newX, newY);
  }

  normalize(boundingBox: Rect) {
    const newX = (this.x - boundingBox.x) / boundingBox.width;
    const newY = (this.y - boundingBox.y) / boundingBox.height;
    return new Point(newX, newY);
  }

  static midPointFromBoundingBox(boundingBox: Rect): Point {
    return new Point(
      boundingBox.x + boundingBox.width / 2,
      boundingBox.y + boundingBox.height / 2
    );
  }
}
