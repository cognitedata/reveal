import { getDiagramInstanceIdFromPathIds } from '../utils';
import { BoundingBox, DiagramInstanceWithPaths } from '../types';
import { PidDocument, PidPath } from '../pid';
import {
  getClosestPointOnSegments,
  getClosestPointsOnSegments,
  PathSegment,
  Point,
} from '../geometry';

import { calculatePidPathsBoundingBox } from './utils';

export class PidGroup {
  pidPaths: PidPath[];
  boundingBox: BoundingBox;
  midPoint: Point;
  isLine: boolean;
  constructor(pidPaths: PidPath[], isLine: boolean) {
    this.pidPaths = pidPaths;
    this.isLine = isLine;
    this.boundingBox = calculatePidPathsBoundingBox(pidPaths);
    this.midPoint = Point.midPointFromBoundingBox(this.boundingBox);
  }

  static fromDiagramInstance(
    pidDocument: PidDocument,
    diagramInstance: DiagramInstanceWithPaths
  ) {
    const pidPaths = diagramInstance.pathIds.map(
      (pathId) => pidDocument.getPidPathById(pathId)!
    );
    return new PidGroup(pidPaths, diagramInstance.type === 'Line');
  }

  getPathSegments(): PathSegment[] {
    const allPathSegments: PathSegment[] = [];
    this.pidPaths.forEach((path) => allPathSegments.push(...path.segmentList));
    return allPathSegments;
  }

  distance(other: PidGroup | Point): number {
    if (other instanceof PidGroup) {
      const closestPoints = getClosestPointsOnSegments(
        this.getPathSegments(),
        other.getPathSegments()
      );

      if (closestPoints === undefined) return Infinity;
      return closestPoints.distance;
    }

    if (other instanceof Point) {
      const closestPoints = getClosestPointOnSegments(
        other,
        this.getPathSegments()
      );

      if (closestPoints === undefined) return Infinity;
      return closestPoints.distance;
    }
    return Infinity;
  }

  isClose(other: PidGroup, threshold = 2): boolean {
    const efficientIsTooFarAway = () => {
      // Checks if the bounding boxes is farther away than `threshold`.
      // This method can return false even though `this` and `other` is farther
      // away than `threshold`
      const maxDistanceBetweenBoxesIfConnected = Math.sqrt(
        (this.boundingBox.width / 2 + other.boundingBox.width / 2) ** 2 +
          (this.boundingBox.height / 2 + other.boundingBox.height / 2) ** 2
      );
      return (
        this.midPoint.distance(other.midPoint) -
          maxDistanceBetweenBoxesIfConnected >
        threshold
      );
    };

    if (efficientIsTooFarAway()) return false;

    return this.distance(other) < threshold;
  }

  get diagramInstanceId() {
    const pathIds = this.pidPaths.map((path) => path.pathId);
    return getDiagramInstanceIdFromPathIds(pathIds);
  }
}
