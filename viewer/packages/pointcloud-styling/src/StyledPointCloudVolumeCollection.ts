/*!
 * Copyright 2024 Cognite AS
 */

import { PointCloudObjectCollection } from './PointCloudObjectCollection';
import { CompletePointCloudAppearance } from './PointCloudAppearance';
import { DMInstanceRefPointCloudObjectCollection } from './DMInstanceRefPointCloudObjectCollection';

/**
 * Represents an either PointCloudObjectCollection or DMInstanceRefPointCloudObjectCollection object collection
 * that is associated with an appearance.
 */
export class StyledPointCloudVolumeCollection {
  constructor(
    public objectCollection: PointCloudObjectCollection | DMInstanceRefPointCloudObjectCollection,
    public style: CompletePointCloudAppearance
  ) {}
}
