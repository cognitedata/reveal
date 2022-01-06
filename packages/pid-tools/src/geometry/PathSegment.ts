import { BoundingBox } from '../types';

import { Point } from './Point';
import { approxeq, getBoundingBox } from './utils';

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
  abstract translateAndScale(
    translatePoint: Point,
    scale: number | Point
  ): PathSegment;

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

  getIntersection = (
    other: PathSegment,
    extendLinesIfNeeded = true
  ): Point | undefined => {
    // Note: This doens not work properly on Curve segments curently

    // line intercept math by Paul Bourke http://paulbourke.net/geometry/pointlineplane/
    const x1 = this.start.x;
    const y1 = this.start.y;
    const x2 = this.stop.x;
    const y2 = this.stop.y;
    const x3 = other.start.x;
    const y3 = other.start.y;
    const x4 = other.stop.x;
    const y4 = other.stop.y;

    // Check if none of the lines are of length 0
    if ((x1 === x2 && y1 === y2) || (x3 === x4 && y3 === y4)) {
      return undefined;
    }

    const denominator = (y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1);

    // Lines are parallel
    if (denominator === 0) {
      return undefined;
    }

    const ua = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / denominator;
    if (!extendLinesIfNeeded) {
      const ub = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / denominator;

      // is the intersection along the segments
      if (ua < 0 || ua > 1 || ub < 0 || ub > 1) {
        return undefined;
      }
    }

    // Return a object with the x and y coordinates of the intersection
    const x = x1 + ua * (x2 - x1);
    const y = y1 + ua * (y2 - y1);

    return new Point(x, y);
  };
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

  translateAndScale(translatePoint: Point, scale: number | Point): LineSegment {
    return new LineSegment(
      this.start.translateAndScale(translatePoint, scale),
      this.stop.translateAndScale(translatePoint, scale)
    );
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

  translateAndScale(
    translatePoint: Point,
    scale: number | Point
  ): CurveSegment {
    return new CurveSegment(
      this.controlPoint1.translateAndScale(translatePoint, scale),
      this.controlPoint2.translateAndScale(translatePoint, scale),
      this.start.translateAndScale(translatePoint, scale),
      this.stop.translateAndScale(translatePoint, scale)
    );
  }
}
