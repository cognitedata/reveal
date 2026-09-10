/*!
 * Copyright 2024 Cognite AS
 */

import type { DMDataSourceType, DMModelIdentifierType } from '../../DataSourceType';
import type { PointCloudStylableObjectProvider } from '../../PointCloudStylableObjectProvider';
import type { PointCloudObject } from '../types';

export class DummyPointCloudDMStylableObjectProvider implements PointCloudStylableObjectProvider<DMDataSourceType> {
  async getPointCloudObjects(_modelIdentifier: DMModelIdentifierType): Promise<PointCloudObject<DMDataSourceType>[]> {
    return [];
  }
}
