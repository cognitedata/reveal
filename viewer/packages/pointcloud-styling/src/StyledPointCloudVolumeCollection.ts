/*!
 * Copyright 2024 Cognite AS
 */

import { PointCloudAnnotationVolumeCollection } from './PointCloudObjectCollection';
import { CompletePointCloudAppearance } from './PointCloudAppearance';
import { PointCloudDMVolumeCollection } from './PointCloudDMVolumeCollection';

/**
 * Represents either an PointCloudAnnotationVolumeCollection or PointCloudDMVolumeCollection
 * that is associated with an appearance.
 */
export class StyledPointCloudVolumeCollection {
  constructor(
    public objectCollection: PointCloudAnnotationVolumeCollection | PointCloudDMVolumeCollection,
    public style: CompletePointCloudAppearance
  ) {}
}
