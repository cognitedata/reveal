/*!
 * Copyright 2022 Cognite AS
 */

import { StylableObjectCollection } from './PointCloudObjectCollection';

/**
 * A simple PointCloudObjectCollection that consists of an explicitly provided list of annotation IDs
 */
export class AnnotationListStylableObjectCollection extends StylableObjectCollection {
  private readonly _annotationIds = new Set<number>();

  constructor(ids: number[]) {
    super();
    for (const id of ids) {
      this._annotationIds.add(id);
    }
  }

  getAnnotationIds(): Iterable<number> {
    return this._annotationIds.values();
  }

  get isLoading(): false {
    return false;
  }
}
