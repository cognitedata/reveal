/*!
 * Copyright 2022 Cognite AS
 */

import { PointCloudObjectCollection } from './PointCloudObjectCollection';
import { PointCloudAppearance } from './PointCloudAppearance';

export class StyledPointCloudObjectCollection {
  constructor(public objectCollection: PointCloudObjectCollection, public style: PointCloudAppearance) {}
}
