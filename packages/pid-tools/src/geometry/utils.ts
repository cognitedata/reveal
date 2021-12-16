import { Point } from './Point';
import { PathSegment } from './PathSegment';

export const approxeq = (v1: number, v2: number, epsilon = 2) =>
  Math.abs(v1 - v2) <= epsilon;

export const approxeqrel = (v1: number, v2: number, epsilon = 0.2) => {
  if (v2 === 0) {
    return v1 === 0;
  }
  return Math.abs(1 - v1 / v2) <= epsilon;
};

export const getBoundingBox = (startPoint: Point, stopPoint: Point) => {
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

export const calculateMidPointFromPathSegments = (
  pathSegments: PathSegment[]
) => {
  let sumX = 0;
  let sumY = 0;
  pathSegments.forEach((pathSegment) => {
    const { midPoint } = pathSegment;
    sumX += midPoint.x;
    sumY += midPoint.y;
  });

  const numSegment = pathSegments.length;
  return new Point(sumX / numSegment, sumY / numSegment);
};

export const getPointTowardOtherPoint = (
  point: Point,
  towardPoint: Point,
  offset: number
) => {
  const length = point.distance(towardPoint);
  const dxNorm = (towardPoint.x - point.x) / length;
  const dyNorm = (towardPoint.y - point.y) / length;

  return new Point(point.x + offset * dxNorm, point.y + offset * dyNorm);
};

export const getPointsCloserToEachOther = (
  start: Point,
  end: Point,
  offset: number
): [Point, Point] => {
  const newStart = getPointTowardOtherPoint(start, end, offset);
  const newEnd = getPointTowardOtherPoint(end, start, offset);
  return [newStart, newEnd];
};

export const getClosestPathSegments = (
  pathSegments1: PathSegment[],
  pathSegments2: PathSegment[]
): [PathSegment, PathSegment] => {
  let closestPathSegment1 = pathSegments1[0];
  let closestPathSegment2 = pathSegments2[0];
  let minDistance = Infinity;

  pathSegments1.forEach((pathSegment1) => {
    pathSegments2.forEach((pathSegment2) => {
      const startMidPoint = pathSegment1.midPoint;
      const endMidPoint = pathSegment2.midPoint;
      const distance = startMidPoint.distance(endMidPoint);
      if (distance < minDistance) {
        minDistance = distance;
        closestPathSegment1 = pathSegment1;
        closestPathSegment2 = pathSegment2;
      }
    });
  });

  return [closestPathSegment1, closestPathSegment2];
};
