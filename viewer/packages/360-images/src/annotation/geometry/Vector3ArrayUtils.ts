/*!
 * Copyright 2024 Cognite AS
 */

import { Box3, Vector3 } from 'three';

export class Vector3ArrayUtils {
  public static getSignedHorizontalArea(polygon: Vector3[]): number {
    const pointCount = polygon.length;
    if (pointCount < 3) {
      return 0;
    }
    let sum = 0.0;
    const firstPoint = polygon[0];
    const p0 = new Vector3();
    const p1 = new Vector3();

    // This applies "Greens theorem" to calculate the area of a polygon
    for (let index = 1; index <= pointCount; index++) {
      p1.copy(polygon[index % pointCount]);
      p1.sub(firstPoint); // Translate by first point, to increase accuracy
      sum += getHorizontalCrossProduct(p0, p1);
      p0.copy(p1);
    }
    return sum / 2;
  }

  public static getCenter(points: Vector3[]): Vector3 {
    return Vector3ArrayUtils.getBoundingBox(points).getCenter(new Vector3());
  }

  public static getBoundingBox(points: Vector3[]): Box3 {
    const boundingBox = new Box3();
    for (const point of points) {
      boundingBox.expandByPoint(point);
    }
    return boundingBox;
  }
}

function getHorizontalCrossProduct(self: Vector3, other: Vector3): number {
  return self.x * other.y - self.y * other.x;
}
