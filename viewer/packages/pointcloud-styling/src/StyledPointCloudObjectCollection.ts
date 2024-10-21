/*!
 * Copyright 2022 Cognite AS
 */

import { PointCloudAnnotationVolumeCollection } from './PointCloudObjectCollection';
import { CompletePointCloudAppearance } from './PointCloudAppearance';

/**
 * Represents an object collection that is associated with an appearance
 * @deprecated Use StyledPointCloudAnnotationVolumeCollection instead.
 */
export class StyledPointCloudObjectCollection {
  constructor(
    public objectCollection: PointCloudAnnotationVolumeCollection,
    public style: CompletePointCloudAppearance
  ) {}
}

/**
 * Alias for StyledPointCloudObjectCollection
 */
export class StyledPointCloudAnnotationVolumeCollection extends StyledPointCloudObjectCollection {}
