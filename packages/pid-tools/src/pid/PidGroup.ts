import {
  Rect,
  DiagramInstanceWithPaths,
  SvgRepresentation,
  SvgPath,
} from '../types';
import { PidDocument, PidPath } from '../pid';
import {
  getClosestPointOnSegments,
  getClosestPointsOnSegments,
  getPointTowardOtherPoint,
  LineSegment,
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
    return this.pidPaths.flatMap((path) => path.segmentList);
  }

  distance(other: Point): number | undefined {
    const closestPoints = getClosestPointOnSegments(
      other,
      this.getPathSegments()
    );

    return closestPoints?.distance;
  }

  getPathSegmentsConnectionPoints(other: PidGroup) {
    return getClosestPointsOnSegments(
      this.getPathSegments(),
      other.getPathSegments()
    );
  }

  efficientIsFartherAway(other: PidGroup, threshold: number): boolean {
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
  }

  isClose(other: PidGroup, threshold: number): boolean {
    if (this.efficientIsFartherAway(other, threshold)) return false;

    const connectionPoints = this.getPathSegmentsConnectionPoints(other);
    return (
      connectionPoints !== undefined && connectionPoints.distance < threshold
    );
  }

  createSvgRepresentation(
    normalized: boolean,
    toFixed: number | null = null
  ): SvgRepresentation {
    return createSvgRepresentation(this.pidPaths, normalized, toFixed);
  }

  static fromSvgPaths(svgPaths: SvgPath[]): PidGroup {
    const pidPaths = svgPaths.map((svgPath) => {
      return PidPath.fromSvgPath(svgPath);
    });
    return new PidGroup(pidPaths);
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

  getConnectionSegment(other: PidInstance): LineSegment {
    // Use the midpoint if the instance is a symbol, otherwise use closest point on the path segments

    const offset = 1; // FIX: Normalize based on document size

    // Both are symbols
    if (!this.isLine && !other.isLine) {
      const point1 = this.midPoint;
      const point2 = other.midPoint;
      return new LineSegment(point1, point2);
    }
    // Both are lines
    if (this.isLine && other.isLine) {
      const connectionPoints = this.getPathSegmentsConnectionPoints(other)!;
      return new LineSegment(connectionPoints.point1, connectionPoints.point2);
    }

    // `this` is symbol and `other` is line
    if (!this.isLine) {
      const otherPathSegments = other.getPathSegments();
      const closestPoint = getClosestPointOnSegments(
        this.midPoint,
        otherPathSegments
      )!;

      const point2 = getPointTowardOtherPoint(
        closestPoint.point,
        closestPoint.percentAlongPath < 0.5
          ? otherPathSegments[closestPoint.index].stop
          : otherPathSegments[closestPoint.index].start,
        offset
      );
      return new LineSegment(this.midPoint, point2);
    }

    // `this` is line and `other` is symbol
    const thisPathSegments = this.getPathSegments();

    const closestPoint = getClosestPointOnSegments(
      other.midPoint,
      thisPathSegments
    )!;

    const point1 = getPointTowardOtherPoint(
      closestPoint.point,
      closestPoint.percentAlongPath < 0.5
        ? thisPathSegments[closestPoint.index].stop
        : thisPathSegments[closestPoint.index].start,
      offset
    );

    return new LineSegment(point1, other.midPoint);
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
