/*!
 * Copyright 2024 Cognite AS
 */

import { CompletePointCloudAppearance } from './PointCloudAppearance';
import { ClassicDataSourceType, DataSourceType } from '@reveal/data-providers';

/**
 * Represents either an PointCloudAnnotationVolumeCollection or PointCloudDMVolumeCollection
 * that is associated with an appearance.
 */
export class StyledPointCloudVolumeCollection<T extends DataSourceType = ClassicDataSourceType> {
  /**
   * Get the volume collection for this StyledPointCloudVolumeCollection
   */
  get volumeCollection(): T['pointCloudCollectionType'] {
    return this.objectCollection;
  }

  constructor(
    /**
     * The volume collection this StyledPointCloudVolumeCollection represents
     * @deprecated
     */
    public objectCollection: T['pointCloudCollectionType'],
    /**
     * The appearance applied by the current StyledPointCloudVolumeCollection
     */
    public style: CompletePointCloudAppearance
  ) {}
}

export class StyledPointCloudObjectCollection extends StyledPointCloudVolumeCollection<ClassicDataSourceType> {}
