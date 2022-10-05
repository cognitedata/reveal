/*!
 * Copyright 2022 Cognite AS
 */

import { ModelIdentifier } from '@reveal/data-providers';
import { PointCloudStylableObjectProvider } from '../PointCloudStylableObjectProvider';
import { PointCloudObjectData } from './PointCloudObjectAnnotationData';

export class LocalPointCloudStylableObjectProvider implements PointCloudStylableObjectProvider {
  async getPointCloudObjects(_modelIdentifier: ModelIdentifier): Promise<PointCloudObjectData> {
    // Currently, we don't support annotations in a local models
    return new PointCloudObjectData([]);
  }
}
