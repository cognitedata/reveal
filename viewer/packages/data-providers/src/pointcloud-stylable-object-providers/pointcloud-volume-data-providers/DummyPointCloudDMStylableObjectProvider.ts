/*!
 * Copyright 2024 Cognite AS
 */

import { CoreDMDataSourceType, DMModelIdentifierType } from '../../DataSourceType';
import { PointCloudStylableObjectProvider } from '../../PointCloudStylableObjectProvider';
import { PointCloudObject } from '../types';

export class DummyPointCloudDMStylableObjectProvider implements PointCloudStylableObjectProvider<CoreDMDataSourceType> {
  async getPointCloudObjects(
    _modelIdentifier: DMModelIdentifierType
  ): Promise<PointCloudObject<CoreDMDataSourceType>[]> {
    return [];
  }
}
