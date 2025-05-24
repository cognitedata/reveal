/*!
 * Copyright 2024 Cognite AS
 */

import { type Ray, type Vector3 } from 'three';
import { type Image360AnnotationDomainObject } from './Image360AnnotationDomainObject';
import { LineCreator } from '../primitives/line/LineCreator';

export class Image360AnnotationCreator extends LineCreator {
  // ==================================================
  // CONSTRUCTOR
  // ==================================================

  public constructor(domainObject: Image360AnnotationDomainObject) {
    super(domainObject);
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
    _point: Vector3 | undefined,
    _isPending: boolean
  ): Vector3 | undefined {
    return ray.direction.clone();
  }
}
