/*!
 * Copyright 2022 Cognite AS
 */

import { PointCloudObjectCollection } from './PointCloudObjectCollection';

export class IndexPointCloudObjectCollection implements PointCloudObjectCollection {
  private readonly _objectIds = new Set<number>();

  constructor(ids: number[]) {
    for (const id of ids) {
      this._objectIds.add(id);
    }
  }

  getObjectIds(): Iterable<number> {
    return this._objectIds.values();
  }
}
