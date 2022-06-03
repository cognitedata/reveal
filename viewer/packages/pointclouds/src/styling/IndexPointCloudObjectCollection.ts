/*!
 * Copyright 2022 Cognite AS
 */

import { PointCloudObjectCollection } from './PointCloudObjectCollection';

export class IndexPointCloudObjectCollection implements PointCloudObjectCollection {
  private readonly _annotationIds = new Set<number>();

  constructor(ids: number[]) {
    for (const id of ids) {
      this._annotationIds.add(id);
    }
  }

  getAnnotationIds(): Iterable<number> {
    return this._annotationIds.values();
  }
}
