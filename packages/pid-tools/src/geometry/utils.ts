/* eslint-disable no-continue */
import { BoundingBox } from '../types';

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

export const getBoundingBox = (
  startPoint: Point,
  stopPoint: Point
): BoundingBox => {
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

export const getEncolosingBoundingBox = (
  boundingBoxes: BoundingBox[]
): BoundingBox => {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  boundingBoxes.forEach((bBox) => {
    minX = Math.min(minX, bBox.x);
    minY = Math.min(minY, bBox.y);
    maxX = Math.max(maxX, bBox.x + bBox.width);
    maxY = Math.max(maxY, bBox.y + bBox.height);
  });

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
  const distance = point.distance(towardPoint);
  if (distance === 0) return point;

  const dxNorm = (towardPoint.x - point.x) / distance;
  const dyNorm = (towardPoint.y - point.y) / distance;

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

type ClosestPointsWithIndecies = {
  point1: Point;
  index1: number;
  percentAlongPath1: number;
  point2: Point;
  index2: number;
  percentAlongPath2: number;
  distance: number;
};

export const getClosestPointsOnSegments = (
  pathSegments1: PathSegment[],
  pathSegments2: PathSegment[]
): ClosestPointsWithIndecies | undefined => {
  let closestPointsWithIndecies: ClosestPointsWithIndecies | undefined;
  let minDistance = Infinity;

  pathSegments1.forEach((pathSegment1, index1) => {
    pathSegments2.forEach((pathSegment2, index2) => {
      const {
        thisPoint,
        thisPercentAlongPath,
        otherPoint,
        otherPercentAlongPath,
        distance,
      } = pathSegment1.getClosestPointsOnSegments(pathSegment2);
      if (distance < minDistance) {
        minDistance = distance;
        closestPointsWithIndecies = {
          point1: thisPoint,
          percentAlongPath1: thisPercentAlongPath,
          index1,
          point2: otherPoint,
          percentAlongPath2: otherPercentAlongPath,
          index2,
          distance,
        };
      }
    });
  });

  return closestPointsWithIndecies;
};

type ClosestPointWithIndex = {
  point: Point;
  index: number;
  distance: number;
  percentAlongPath: number;
};

export const getClosestPointOnSegments = (
  point: Point,
  pathSegments: PathSegment[]
): ClosestPointWithIndex | undefined => {
  let closestPointWithIndex: ClosestPointWithIndex | undefined;
  let minDistance = Infinity;

  pathSegments.forEach((pathSegment, index) => {
    const { pointOnSegment, percentAlongPath, distance } =
      pathSegment.getClosestPointOnSegment(point);
    if (distance < minDistance) {
      minDistance = distance;
      closestPointWithIndex = {
        point: pointOnSegment,
        distance,
        index,
        percentAlongPath,
      };
    }
  });

  return closestPointWithIndex;
};
