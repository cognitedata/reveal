/*!
 * Copyright 2022 Cognite AS
 */

import { ClassicDataSourceType, ClassicModelIdentifierType } from '../DataSourceType';
import { PointCloudStylableObjectProvider } from '../PointCloudStylableObjectProvider';
import { PointCloudObject } from './types';

export class DummyPointCloudStylableObjectProvider implements PointCloudStylableObjectProvider<ClassicDataSourceType> {
  async getPointCloudObjects(_modelIdentifier: ClassicModelIdentifierType): Promise<PointCloudObject[]> {
    return [];
  }
}
