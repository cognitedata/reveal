/*!
 * Copyright 2022 Cognite AS
 */

import { ModelIdentifier } from '@reveal/data-providers';
import { PointCloudStylableObjectProvider } from '../PointCloudStylableObjectProvider';
import { PointCloudObject } from './types';

export class DummyPointCloudStylableObjectProvider implements PointCloudStylableObjectProvider {
  async getPointCloudObjects(_modelIdentifier: ModelIdentifier): Promise<PointCloudObject[]> {
    return [];
  }
}
