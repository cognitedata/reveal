/*!
 * Copyright 2024 Cognite AS
 */

import { DMModelIdentifierType, DMDataSourceType } from '@reveal/data-providers';
import { PointCloudStylableObjectProvider } from '../../PointCloudStylableObjectProvider';
import { PointCloudObject } from '../types';

export class DummyPointCloudDMStylableObjectProvider implements PointCloudStylableObjectProvider<DMDataSourceType> {
  async getPointCloudObjects(_modelIdentifier: DMModelIdentifierType): Promise<PointCloudObject<DMDataSourceType>[]> {
    return [];
  }
}
