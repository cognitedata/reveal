/*!
 * Copyright 2024 Cognite AS
 */

import { type Ray, type Vector3 } from 'three';
import { AnnotationPolygonDomainObject } from './AnnotationPolygonDomainObject';
import { type BaseTool } from '../../base/commands/BaseTool';
import { LineCreator } from '../primitives/line/LineCreator';

/**
 * Helper class for generate a LineDomainObject by clicking around
 */
export class AnnotationPolygonCreator extends LineCreator {
  // ==================================================
  // CONSTRUCTOR
  // ==================================================

  public constructor(tool: BaseTool) {
    super(tool, new AnnotationPolygonDomainObject());
  }

  // ==================================================
  // OVERRIDES
  // ==================================================

  public override get preferIntersection(): boolean {
    return false;
  }

  public override get minimumPointCount(): number {
    return 3;
  }

  public override get maximumPointCount(): number {
    return Number.MAX_SAFE_INTEGER;
  }

  protected override transformInputPoint(
    ray: Ray,
    point: Vector3 | undefined,
    _isPending: boolean
  ): Vector3 | undefined {
    point = ray.origin.clone();
    point.addScaledVector(ray.direction, 5);
    return point;
  }
}
