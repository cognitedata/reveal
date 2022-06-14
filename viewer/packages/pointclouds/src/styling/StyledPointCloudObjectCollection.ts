/*!
 * Copyright 2022 Cognite AS
 */

import { StylableObjectCollection } from './PointCloudObjectCollection';
import { PointCloudAppearance } from './PointCloudAppearance';

export class StylablePointCloudObjectCollection {
  constructor(public objectCollection: StylableObjectCollection, public style: PointCloudAppearance) {}
}
