/*!
 * Copyright 2024 Cognite AS
 */

import { ModelIdentifier } from '../../ModelIdentifier';
import { PointCloudStylableObjectProvider } from '../../PointCloudStylableObjectProvider';
import { DMPointCloudDataType, PointCloudObject } from '../types';

export class DummyPointCloudDMStylableObjectProvider implements PointCloudStylableObjectProvider<DMPointCloudDataType> {
  async getPointCloudObjects(_modelIdentifier: ModelIdentifier): Promise<PointCloudObject<DMPointCloudDataType>[]> {
    return [];
  }
}
