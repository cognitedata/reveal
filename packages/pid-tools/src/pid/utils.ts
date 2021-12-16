import { BoundingBox } from '../types';
import { PidPath } from '../pid';

export const calculatePidPathsBoundingBox = (
  pidPaths: PidPath[]
): BoundingBox => {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  pidPaths.forEach((pidPath) => {
    pidPath.segmentList.forEach((pathSegment) => {
      const bBox = pathSegment.boundingBox;
      minX = Math.min(minX, bBox.x);
      minY = Math.min(minY, bBox.y);
      maxX = Math.max(maxX, bBox.x + bBox.width);
      maxY = Math.max(maxY, bBox.y + bBox.height);
    });
  });

  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
  };
};
