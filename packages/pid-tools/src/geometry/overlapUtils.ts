import { boxBox, lineLine, lineBox } from 'intersects';

import { BoundingBox } from '../types';

import { PathSegment } from './PathSegment';

export const overlapLineLine = (
  pathSegments1: PathSegment[],
  pathSegments2: PathSegment[]
) => {
  for (let i = 0; i < pathSegments1.length; i++) {
    const seg1 = pathSegments1[i];
    for (let j = 0; j < pathSegments2.length; j++) {
      const seg2 = pathSegments2[j];
      const isOverlap = lineLine(
        seg1.start.x,
        seg1.start.y,
        seg1.stop.x,
        seg1.stop.y,
        seg2.start.x,
        seg2.start.y,
        seg2.stop.x,
        seg2.stop.y
      );
      if (isOverlap) {
        return true;
      }
    }
  }
  return false;
};

export const overlapLineBox = (
  pathSegments: PathSegment[],
  boundingBox: BoundingBox
) => {
  for (let i = 0; i < pathSegments.length; i++) {
    const seg1 = pathSegments[i];
    const isOverlap = lineBox(
      seg1.start.x,
      seg1.start.y,
      seg1.stop.x,
      seg1.stop.y,
      boundingBox.x,
      boundingBox.y,
      boundingBox.width,
      boundingBox.height
    );
    if (isOverlap) {
      return true;
    }
  }
  return false;
};

export const overlapBoxBox = (
  boundingBox1: BoundingBox,
  boundingBox2: BoundingBox
) => {
  const isOverlap = boxBox(
    boundingBox1.x,
    boundingBox1.y,
    boundingBox1.width,
    boundingBox1.height,
    boundingBox2.x,
    boundingBox2.y,
    boundingBox2.width,
    boundingBox2.height
  );

  return isOverlap;
};
