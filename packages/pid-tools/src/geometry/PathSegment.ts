import { Rect } from '../types';

import { Point } from './Point';
import {
  angleDifference,
  approxeq,
  getBoundingBox,
  getPointTowardOtherPoint,
  mod,
} from './utils';

export type IntersectionData = {
  intersection: Point;
  thisPercentAlongPath: number;
  otherPercentAlongPath: number;
};

export type ClosestPointOnSegment = {
  pointOnSegment: Point;
  percentAlongPath: number;
  distance: number;
};

export type ClosestPointsOnSegment = {
  thisPoint: Point;
  thisPercentAlongPath: number;
  otherPoint: Point;
  otherPercentAlongPath: number;
  distance: number; // distance between `thisPoint` and `otherPoint`
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
  abstract get boundingBox(): Rect;
  abstract translateAndScale(
    translatePoint: Point,
    scale: number | Point
  ): PathSegment;
  abstract rotate(degAngle: number, pivotPoint: Point | undefined): PathSegment;

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
    // Returns angle in degrees between 0 and 360. Follows unit circle: 0 - right, 90 - up, 180 - left and 270 - down.
    const dy = this.stop.y - this.start.y;
    const dx = this.stop.x - this.start.x;
    let theta = Math.atan2(dy, dx);
    theta *= 180 / Math.PI; // rads to degs

    return mod(theta, 360);
  }

  getIntersection = (other: PathSegment): IntersectionData | undefined => {
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

    const thisPercentAlongPath =
      ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / denominator;
    const otherPercentAlongPath =
      ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / denominator;

    // Return a object with the x and y coordinates of the intersection
    const x = x1 + thisPercentAlongPath * (x2 - x1);
    const y = y1 + otherPercentAlongPath * (y2 - y1);

    return {
      intersection: new Point(x, y),
      thisPercentAlongPath,
      otherPercentAlongPath,
    };
  };

  getClosestPointOnSegment(point: Point): ClosestPointOnSegment {
    // Note: This does not work properly on Curve segments curently
    // Based on: https://stackoverflow.com/a/6853926
    const A = point.x - this.start.x;
    const B = point.y - this.start.y;
    const C = this.stop.x - this.start.x;
    const D = this.stop.y - this.start.y;

    const dot = A * C + B * D;
    const lenSq = C * C + D * D;
    let percentAlongPath = 0;
    if (lenSq !== 0) {
      percentAlongPath = dot / lenSq;
    }

    percentAlongPath = Math.min(1, Math.max(percentAlongPath, 0));
    const pointOnSegment = this.getPointOnSegment(percentAlongPath);
    const distance = pointOnSegment.distance(point);
    return { pointOnSegment, percentAlongPath, distance };
  }

  getPointOnSegment(percentAlongPath: number): Point {
    return getPointTowardOtherPoint(
      this.start,
      this.stop,
      percentAlongPath * this.length
    );
  }

  getClosestPointsOnSegments(other: PathSegment): ClosestPointsOnSegment {
    const intersectionData = this.getIntersection(other);
    if (intersectionData !== undefined) {
      let { thisPercentAlongPath, otherPercentAlongPath } = intersectionData;
      thisPercentAlongPath = Math.max(0, Math.min(1, thisPercentAlongPath));
      otherPercentAlongPath = Math.max(0, Math.min(1, otherPercentAlongPath));

      const thisPoint = this.getPointOnSegment(thisPercentAlongPath);
      const otherPoint = other.getPointOnSegment(otherPercentAlongPath);
      const distance = thisPoint.distance(otherPoint);
      return {
        thisPoint,
        thisPercentAlongPath,
        otherPoint,
        otherPercentAlongPath,
        distance,
      };
    }

    // parallell
    const {
      pointOnSegment: closestPointStart,
      percentAlongPath: startPercentAlongPath,
      distance: startDistance,
    } = other.getClosestPointOnSegment(this.start);
    const {
      pointOnSegment: closestPointStop,
      percentAlongPath: stopPercentAlongPath,
      distance: stopDistance,
    } = other.getClosestPointOnSegment(this.stop);

    if (startDistance < stopDistance) {
      return {
        thisPoint: this.start,
        thisPercentAlongPath: 0,
        otherPoint: closestPointStart,
        otherPercentAlongPath: startPercentAlongPath,
        distance: startDistance,
      };
    }
    return {
      thisPoint: this.stop,
      thisPercentAlongPath: 1,
      otherPoint: closestPointStop,
      otherPercentAlongPath: stopPercentAlongPath,
      distance: stopDistance,
    };
  }
}

export enum EdgePoint {
  Start,
  Stop,
  Other,
}

export interface DistanceWithLineJump {
  distance: number;
  isLineJump: boolean;
  thisClosestPoint: EdgePoint;
  otherClosestPoint: EdgePoint;
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

  rotate(degAngle: number, pivotPoint: Point | undefined): LineSegment {
    return new LineSegment(
      this.start.rotate(degAngle, pivotPoint),
      this.stop.rotate(degAngle, pivotPoint)
    );
  }

  distanceWithLineJump(
    other: LineSegment,
    edgeThreshold = 0.05,
    angleThreshold = 5
  ): DistanceWithLineJump {
    const isCloseToEdge = (percentAlongPath: number) =>
      percentAlongPath < edgeThreshold || percentAlongPath > 1 - edgeThreshold;

    const {
      thisPercentAlongPath,
      thisPoint,
      otherPercentAlongPath,
      otherPoint,
      distance,
    } = this.getClosestPointsOnSegments(other);

    const angle1 = this.angle;
    const angle2 = other.angle;
    const angle3 = new LineSegment(thisPoint, otherPoint).angle;

    let thisClosestPoint = EdgePoint.Other;
    if (isCloseToEdge(thisPercentAlongPath)) {
      thisClosestPoint =
        thisPercentAlongPath < edgeThreshold ? EdgePoint.Start : EdgePoint.Stop;
    }

    let otherClosestPoint = EdgePoint.Other;
    if (isCloseToEdge(otherPercentAlongPath)) {
      otherClosestPoint =
        otherPercentAlongPath < edgeThreshold
          ? EdgePoint.Start
          : EdgePoint.Stop;
    }

    const isLineJump =
      isCloseToEdge(thisPercentAlongPath) &&
      isCloseToEdge(otherPercentAlongPath) &&
      approxeq(
        angleDifference(angle1, angle2, 'uniDirected'),
        0,
        angleThreshold
      ) &&
      approxeq(
        angleDifference(angle1, angle3, 'uniDirected'),
        0,
        angleThreshold
      );

    return { distance, isLineJump, thisClosestPoint, otherClosestPoint };
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

  // This is a naive implementation. The geometric mid point should include `controlPoint1` and `controlPoint2`
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

  rotate(degAngle: number, pivotPoint: Point | undefined): CurveSegment {
    return new CurveSegment(
      this.controlPoint1.rotate(degAngle, pivotPoint),
      this.controlPoint2.rotate(degAngle, pivotPoint),
      this.start.rotate(degAngle, pivotPoint),
      this.stop.rotate(degAngle, pivotPoint)
    );
  }
}
