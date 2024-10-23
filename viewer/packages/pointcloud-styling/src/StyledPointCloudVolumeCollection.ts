/*!
 * Copyright 2024 Cognite AS
 */

import { PointCloudAnnotationVolumeCollection } from './PointCloudObjectCollection';
import { CompletePointCloudAppearance } from './PointCloudAppearance';
import { PointCloudDMVolumeCollection } from './PointCloudDMVolumeCollection';
import { ClassicDataSourceType, DataSourceType } from '@reveal/data-providers';

/**
 * Represents either an PointCloudAnnotationVolumeCollection or PointCloudDMVolumeCollection
 * that is associated with an appearance.
 */
export class StyledPointCloudVolumeCollection<T extends DataSourceType> {
  constructor(
    public objectCollection: T['pointCloudCollectionType'],
    public style: CompletePointCloudAppearance
  ) {}
}

export class StyledPointCloudObjectCollection extends StyledPointCloudVolumeCollection<ClassicDataSourceType> {}
