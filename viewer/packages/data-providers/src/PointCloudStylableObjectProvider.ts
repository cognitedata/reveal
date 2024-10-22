/*!
 * Copyright 2022 Cognite AS
 */

import { ModelIdentifier } from './ModelIdentifier';
import {
  ClassicPointCloudDataType,
  PointCloudDataType,
  PointCloudObject
} from './pointcloud-stylable-object-providers/types';

export interface PointCloudStylableObjectProvider<T extends PointCloudDataType = ClassicPointCloudDataType> {
  getPointCloudObjects(modelIdentifier: ModelIdentifier, revisionSpace?: string): Promise<PointCloudObject<T>[]>;
}
