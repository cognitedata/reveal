/*!
 * Copyright 2022 Cognite AS
 */

import { PointCloudObjectCollection } from './PointCloudObjectCollection';

/**
 * A simple PointCloudObjectCollection that consists of an explicitly provided list of annotation IDs
 */
export class AnnotationIdPointCloudObjectCollection extends PointCloudObjectCollection {
  private readonly _annotationIds = new Set<number>();

  constructor(ids: Iterable<number>) {
    super();
    this._annotationIds = new Set<number>(ids);
  }

  getAnnotationIds(): Iterable<number> {
    return this._annotationIds.values();
  }

  get isLoading(): false {
    return false;
  }
}
