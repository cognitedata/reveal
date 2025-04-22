/*!
 * Copyright 2024 Cognite AS
 */

import { Vector3, type Plane, Line3 } from 'three';
import { Range3 } from './Range3';

export function getBoundingBoxFromPlanes(planes: Plane[], originalBoundingBox: Range3): Range3 {
  const result = new Range3();
  const tempVector = new Vector3();
  {
    const horizontalPlanes = planes.filter((plane) => isHorizontalPlane(plane));

    // Calculate the z range based on visible corners
    for (let corner = 0; corner < 8; corner += 4) {
      const cornerPoint = originalBoundingBox.getCornerPoint(corner, tempVector);
      if (isVisible(horizontalPlanes, cornerPoint)) {
        result.z.add(cornerPoint.z);
      }
    }
    // Calculate the z range based on the horizontal planes
    const origin = new Vector3(0, 0, 0);
    for (const plane of horizontalPlanes) {
      const pointOnPlane = plane.projectPoint(origin, tempVector);
      if (
        isVisible(horizontalPlanes, pointOnPlane, plane) &&
        originalBoundingBox.z.isInside(pointOnPlane.z)
      ) {
        result.z.add(pointOnPlane.z);
      }
    }
  }
  {
    const verticalPlanes = planes.filter((plane) => isVerticalPlane(plane));
    // Calculate the x and y range based on visible corners
    for (let corner = 0; corner < 8; corner++) {
      const cornerPoint = originalBoundingBox.getCornerPoint(corner, tempVector);
      if (isVisible(verticalPlanes, cornerPoint)) {
        result.addHorizontal(cornerPoint);
      }
    }
    // Calculate the x and y range based on the vertical planes
    for (const plane of verticalPlanes) {
      const start = new Vector3();
      const end = new Vector3();
      if (!originalBoundingBox.getVerticalPlaneIntersection(plane, false, start, end)) {
        continue;
      }
      // Cut the line into smaller lines by the other planes
      const lines = new Array<Line3>();
      lines.push(new Line3(start, end));

      for (const otherPlane of verticalPlanes) {
        if (otherPlane === plane) {
          continue;
        }
        const length = lines.length; // Note the lines array is growing
        for (let i = 0; i < length; i++) {
          const line = lines[i];
          const intersection = otherPlane.intersectLine(line, new Vector3());
          if (intersection === null) {
            continue;
          }
          lines.push(new Line3(intersection, line.end.clone()));
          line.end.copy(intersection);
        }
      }
      // Check if the each line segments is visible, if so add to result range
      for (const line of lines) {
        const center = line.getCenter(tempVector);
        if (!isVisible(verticalPlanes, center, plane)) {
          continue;
        }
        result.addHorizontal(line.start);
        result.addHorizontal(line.end);
      }
    }
  }
  return result;

  function isHorizontalPlane(plane: Plane): boolean {
    return plane.normal.x === 0 && plane.normal.y === 0;
  }

  function isVerticalPlane(plane: Plane): boolean {
    return plane.normal.z === 0;
  }

  function isVisible(planes: Plane[], point: Vector3, except?: Plane): boolean {
    for (const plane of planes) {
      if (except !== undefined && plane === except) {
        continue;
      }
      if (plane.distanceToPoint(point) < 0) {
        return false;
      }
    }
    return true;
  }
}
