import { BoundingBox } from 'types';

export const approxeq = (v1: number, v2: number, epsilon = 2) =>
  Math.abs(v1 - v2) <= epsilon;

export const approxeqrel = (v1: number, v2: number, epsilon = 0.2) => {
  if (v2 === 0) {
    return v1 === 0;
  }
  return Math.abs(1 - v1 / v2) <= epsilon;
};

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

  translateAndScale(translatePoint: Point, scale: number) {
    const newX = scale * (this.x - translatePoint.x);
    const newY = scale * (this.y - translatePoint.y);
    return new Point(newX, newY);
  }
}
const getBoundingBox = (startPoint: Point, stopPoint: Point) => {
  const minX = Math.min(startPoint.x, stopPoint.x);
  const minY = Math.min(startPoint.y, stopPoint.y);
  const maxX = Math.max(startPoint.x, stopPoint.x);
  const maxY = Math.max(startPoint.y, stopPoint.y);

  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
  };
};

export abstract class PathSegment {
  start: Point;
  stop: Point;
  pathType: string;
  constructor(start: Point, stop: Point) {
    this.start = start;
    this.stop = stop;
    this.pathType = 'PathSegment';
  }
  abstract isSimilar(other: PathSegment): boolean;
  abstract isEqual(other: PathSegment): boolean;
  abstract get midPoint(): Point;
  abstract get length(): number;
  abstract get boundingBox(): BoundingBox;

  getTranslationAndScaleDistance(
    thisOrigin: Point,
    thisScale: number,
    other: PathSegment,
    otherOrigin: Point,
    otherScale: number
  ): number {
    if (this.pathType !== other.pathType) return Infinity;

    const thisStart = this.start.translateAndScale(thisOrigin, thisScale);
    const thisStop = this.stop.translateAndScale(thisOrigin, thisScale);
    const otherStart = other.start.translateAndScale(otherOrigin, otherScale);
    const otherStop = other.stop.translateAndScale(otherOrigin, otherScale);

    const sameDistance =
      thisStart.distance(otherStart) + thisStop.distance(otherStop);
    const oppositeDistance =
      thisStart.distance(otherStop) + thisStop.distance(otherStart);
    return Math.min(sameDistance, oppositeDistance);
  }

  get angle() {
    const dy = this.stop.y - this.start.y;
    const dx = this.stop.x - this.start.x;
    let theta = Math.atan2(dy, dx);
    theta *= 180 / Math.PI; // rads to degs
    return theta;
  }
}

export class LineSegment extends PathSegment {
  constructor(start: Point, stop: Point) {
    super(start, stop);
    this.pathType = 'LineSegment';
  }

  isSimilar(other: PathSegment): boolean {
    if (this.pathType !== other.pathType) return false;

    const thisDx = Math.abs(this.stop.x - this.start.x);
    const thisDy = Math.abs(this.stop.y - this.start.y);
    const otherDx = Math.abs(other.stop.x - other.start.x);
    const otherDy = Math.abs(other.stop.y - other.start.y);

    return approxeq(thisDx, otherDx) && approxeq(thisDy, otherDy);
  }

  isEqual(other: PathSegment): boolean {
    if (this.pathType !== other.pathType) return false;
    return (
      approxeq(this.start.distance(other.start), 0) &&
      approxeq(this.stop.distance(other.stop), 0)
    );
  }

  get midPoint(): Point {
    return this.start.average(this.stop);
  }

  get length() {
    return this.start.distance(this.stop);
  }

  get boundingBox() {
    return getBoundingBox(this.start, this.stop);
  }
}

export class CurveSegment extends PathSegment {
  controlPoint1: Point;
  controlPoint2: Point;
  constructor(
    controlPoint1: Point,
    controlPoint2: Point,
    start: Point,
    stop: Point
  ) {
    super(start, stop);
    this.controlPoint1 = controlPoint1;
    this.controlPoint2 = controlPoint2;
    this.pathType = 'CurveSegment';
  }

  // true if it is a `CurveSegment` with same length and angle of `start` and `stop`
  // Should `start` and `stop` be added in the comparison?
  isSimilar(other: PathSegment): boolean {
    if (this.pathType !== other.pathType) return false;

    const dxThis = this.stop.x - this.start.x;
    const dyThis = this.stop.y - this.start.y;
    const dxOther = other.stop.x - other.start.x;
    const dyOther = other.stop.y - other.start.y;

    return approxeq(dxThis, dxOther) && approxeq(dyThis, dyOther);
  }

  isEqual(other: PathSegment): boolean {
    if (!(other instanceof CurveSegment)) return false;

    return (
      approxeq(this.start.distance(other.start), 0) &&
      approxeq(this.stop.distance(other.stop), 0) &&
      approxeq(this.controlPoint1.distance(other.controlPoint1), 0) &&
      approxeq(this.controlPoint2.distance(other.controlPoint2), 0)
    );
  }

  // This is a naive implementation. The geometric mid point should include `start` and `stop`
  get midPoint(): Point {
    return this.start.average(this.stop);
  }

  get length(): number {
    return this.start.distance(this.stop);
  }

  // Currently we do not handle the curve part of the bounding box
  // It´s seen only as a strait line.
  get boundingBox() {
    return getBoundingBox(this.start, this.stop);
  }
}
