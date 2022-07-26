import { Rect } from '../types';
import { calculatePidPathsBoundingBox } from '../pid/utils';
import { PidPath } from '../pid/PidPath';

import { Point } from './Point';

export class BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
  constructor(x: number, y: number, width: number, height: number) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }

  encloses(point: Point, includeBorder = true): boolean {
    if (includeBorder) {
      return (
        point.x >= this.x &&
        point.x <= this.x + this.width &&
        point.y >= this.y &&
        point.y <= this.y + this.height
      );
    }
    return (
      point.x > this.x &&
      point.x < this.x + this.width &&
      point.y > this.y &&
      point.y < this.y + this.height
    );
  }

  enclosesBoundingBox(rect: Rect, includeBorder = true): boolean {
    return (
      this.encloses(new Point(rect.x, rect.y), includeBorder) &&
      this.encloses(new Point(rect.x + rect.width, rect.y), includeBorder) &&
      this.encloses(new Point(rect.x, rect.y + rect.height), includeBorder) &&
      this.encloses(
        new Point(rect.x + rect.width, rect.y + rect.height),
        includeBorder
      )
    );
  }

  normalize(viewBox: Rect) {
    const newX = (this.x - viewBox.x) / viewBox.width;
    const newY = (this.y - viewBox.y) / viewBox.height;
    const newWidth = this.width / viewBox.width;
    const newHeight = this.height / viewBox.height;
    return new BoundingBox(newX, newY, newWidth, newHeight);
  }

  midPoint(): Point {
    return new Point(this.x + this.width / 2, this.y + this.height / 2);
  }

  distance(other: BoundingBox): number {
    return this.midPoint().distance(other.midPoint());
  }

  pad(padding: number): BoundingBox {
    return new BoundingBox(
      this.x - padding,
      this.y - padding,
      this.width + 2 * padding,
      this.height + 2 * padding
    );
  }

  toRect(): Rect {
    return { x: this.x, y: this.y, width: this.width, height: this.height };
  }

  static fromRect(rect: Rect): BoundingBox {
    return new BoundingBox(rect.x, rect.y, rect.width, rect.height);
  }

  static fromPidPaths(pidPaths: PidPath[]): BoundingBox {
    return BoundingBox.fromRect(calculatePidPathsBoundingBox(pidPaths));
  }

  static fromPoints(startPoint: Point, endPoint: Point): BoundingBox {
    return new BoundingBox(
      Math.min(endPoint.x, startPoint.x),
      Math.min(endPoint.y, startPoint.y),
      Math.abs(endPoint.x - startPoint.x),
      Math.abs(endPoint.y - startPoint.y)
    );
  }
}
