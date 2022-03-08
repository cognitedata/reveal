import { Rect, DiagramInstanceWithPaths, SvgRepresentation } from '../types';
import { PidDocument, PidPath } from '../pid';
import {
  getClosestPointOnSegments,
  getClosestPointsOnSegments,
  PathSegment,
  Point,
} from '../geometry';

import { calculatePidPathsBoundingBox, createSvgRepresentation } from './utils';

export class PidGroup {
  pidPaths: PidPath[];
  boundingBox: Rect;
  midPoint: Point;
  constructor(pidPaths: PidPath[]) {
    this.pidPaths = pidPaths;
    this.boundingBox = calculatePidPathsBoundingBox(pidPaths);
    this.midPoint = Point.midPointFromBoundingBox(this.boundingBox);
  }

  getPathSegments(): PathSegment[] {
    const allPathSegments: PathSegment[] = [];
    this.pidPaths.forEach((path) => allPathSegments.push(...path.segmentList));
    return allPathSegments;
  }

  distance(other: PidInstance | Point): number {
    if (other instanceof PidInstance) {
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

  isClose(other: PidInstance, threshold = 2): boolean {
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

  createSvgRepresentation(
    normalized: boolean,
    toFixed: number | null = null
  ): SvgRepresentation {
    return createSvgRepresentation(this.pidPaths, normalized, toFixed);
  }
}

export class PidInstance extends PidGroup {
  isLine: boolean;
  id: string;
  constructor(pidPaths: PidPath[], isLine: boolean, id: string) {
    super(pidPaths);
    this.isLine = isLine;
    this.id = id;
  }

  static fromDiagramInstance(
    pidDocument: PidDocument,
    diagramInstance: DiagramInstanceWithPaths
  ) {
    const pidPaths = diagramInstance.pathIds.map(
      (pathId) => pidDocument.getPidPathById(pathId)!
    );
    return new PidInstance(
      pidPaths,
      diagramInstance.type === 'Line',
      diagramInstance.id
    );
  }
}
