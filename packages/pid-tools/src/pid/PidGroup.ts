import { getDiagramInstanceIdFromPathIds } from '../utils';
import { BoundingBox, DiagramInstanceWithPaths } from '../types';
import { PidDocument, PidPath } from '../pid';
import { PathSegment } from '../geometry';
import {
  overlapBoxBox,
  overlapLineBox,
  overlapLineLine,
} from '../geometry/overlapUtils';

import { calculatePidPathsBoundingBox } from './utils';

export class PidGroup {
  pidPaths: PidPath[];
  boundingBox: BoundingBox;
  isLine: boolean;
  constructor(pidPaths: PidPath[], isLine: boolean) {
    this.pidPaths = pidPaths;
    this.boundingBox = calculatePidPathsBoundingBox(pidPaths);
    this.isLine = isLine;
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

  isOverlap(other: PidGroup): boolean {
    if (this.isLine && other.isLine) {
      return overlapLineLine(this.getPathSegments(), other.getPathSegments());
    }
    if (this.isLine && !other.isLine) {
      return overlapLineBox(this.getPathSegments(), other.boundingBox);
    }
    if (!this.isLine && other.isLine) {
      return overlapLineBox(other.getPathSegments(), this.boundingBox);
    }
    if (!this.isLine && !other.isLine) {
      return overlapBoxBox(this.boundingBox, other.boundingBox);
    }
    return false;
  }

  get diagramInstanceId() {
    const pathIds = this.pidPaths.map((path) => path.pathId);
    return getDiagramInstanceIdFromPathIds(pathIds);
  }
}
