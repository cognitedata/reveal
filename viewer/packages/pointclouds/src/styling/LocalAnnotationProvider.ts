/*!
 * Copyright 2022 Cognite AS
 */

import { ModelIdentifier } from '@reveal/modeldata-api';
import { IAnnotationProvider } from './IAnnotationProvider';
import { PointCloudObjectAnnotationData } from './PointCloudObjectAnnotationData';

export class LocalAnnotationProvider implements IAnnotationProvider {
  async getAnnotations(_modelIdentifier: ModelIdentifier): Promise<PointCloudObjectAnnotationData> {
    // Currently, we don't support annotations in a local models
    return new PointCloudObjectAnnotationData([]);
  }
}
