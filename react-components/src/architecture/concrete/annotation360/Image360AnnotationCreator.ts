/*!
 * Copyright 2024 Cognite AS
 */

import { type Ray, type Vector3 } from 'three';
import { Image360AnnotationDomainObject } from './Image360AnnotationDomainObject';
import { type BaseTool } from '../../base/commands/BaseTool';
import { LineCreator } from '../primitives/line/LineCreator';
import assert from 'assert';

export class Image360AnnotationCreator extends LineCreator {
  // ==================================================
  // CONSTRUCTOR
  // ==================================================

  public constructor(tool: BaseTool) {
    const image360Id = tool.renderTarget.viewer.getActive360ImageInfo()?.image360.id;
    assert(image360Id !== undefined, 'Image360AnnotationCreator: image360Id is undefined');
    super(tool, new Image360AnnotationDomainObject(image360Id));
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
