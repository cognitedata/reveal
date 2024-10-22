/*!
 * Copyright 2024 Cognite AS
 */

import { DMInstanceRef } from '@reveal/data-providers';

/**
 * A simple PointCloudDMVolumeCollection that consists of an explicitly provided list of data model instance.
 */
export class PointCloudDMVolumeCollection {
  private readonly _dataModelInstanceRef;

  constructor(ids: Iterable<DMInstanceRef>) {
    this._dataModelInstanceRef = new Set<DMInstanceRef>(ids);
  }

  /**
   * Gets data model external IDs for the objects represented by this PointCloudDMVolumeCollection instance
   */
  getDataModelInstanceRefs(): Iterable<DMInstanceRef> {
    return this._dataModelInstanceRef.values();
  }

  /**
   * Is the collection is still loading data in the background i.e. not yet ready for use
   */
  get isLoading(): false {
    return false;
  }
}
