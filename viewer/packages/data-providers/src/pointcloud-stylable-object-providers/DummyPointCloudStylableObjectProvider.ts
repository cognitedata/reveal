/*!
 * Copyright 2022 Cognite AS
 */

import { ModelIdentifier } from '../ModelIdentifier';
import { PointCloudStylableObjectProvider } from '../PointCloudStylableObjectProvider';
import { PointCloudObject } from './types';

export class DummyPointCloudStylableObjectProvider implements PointCloudStylableObjectProvider<ModelIdentifier> {
  async getPointCloudObjects(_modelIdentifier: ModelIdentifier): Promise<PointCloudObject[]> {
    return [];
  }
}
