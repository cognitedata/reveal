/*!
 * Copyright 2022 Cognite AS
 */

import type { ClassicDataSourceType, ClassicModelIdentifierType } from '../DataSourceType';
import type { PointCloudStylableObjectProvider } from '../PointCloudStylableObjectProvider';
import type { PointCloudObject } from './types';

export class DummyPointCloudStylableObjectProvider implements PointCloudStylableObjectProvider<ClassicDataSourceType> {
  async getPointCloudObjects(_modelIdentifier: ClassicModelIdentifierType): Promise<PointCloudObject[]> {
    return [];
  }
}
