import { BoundingBox } from '../types';

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

  translateAndScale(translatePoint: Point, scale: number | Point) {
    let scaleX;
    let scaleY;
    if (scale instanceof Point) {
      scaleX = scale.x;
      scaleY = scale.y;
    } else {
      scaleX = scale;
      scaleY = scale;
    }
    const newX = scaleX * (this.x - translatePoint.x);
    const newY = scaleY * (this.y - translatePoint.y);
    return new Point(newX, newY);
  }

  normalize(boundingBox: BoundingBox) {
    const newX = (this.x - boundingBox.x) / boundingBox.width;
    const newY = (this.y - boundingBox.y) / boundingBox.height;
    return new Point(newX, newY);
  }

  static midPointFromBoundingBox(boundingBox: BoundingBox): Point {
    return new Point(
      boundingBox.x + boundingBox.width / 2,
      boundingBox.y + boundingBox.height / 2
    );
  }
}
