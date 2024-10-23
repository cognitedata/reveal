/*!
 * Copyright 2024 Cognite AS
 */

import { DMDataSourceType, DMModelIdentifierType } from 'api-entry-points/core';
import { ModelIdentifier } from '../../ModelIdentifier';
import { PointCloudStylableObjectProvider } from '../../PointCloudStylableObjectProvider';
import { PointCloudObject } from '../types';

export class DummyPointCloudDMStylableObjectProvider implements PointCloudStylableObjectProvider<DMDataSourceType> {
  async getPointCloudObjects(_modelIdentifier: DMModelIdentifierType): Promise<PointCloudObject<DMDataSourceType>[]> {
    return [];
  }
}
