/*!
 * Copyright 2022 Cognite AS
 */

import { ModelIdentifier } from '@reveal/data-providers';
import { PointCloudObjectAnnotationData } from './PointCloudObjectAnnotationData';

export interface IAnnotationProvider {
  getAnnotations(modelIdentifier: ModelIdentifier): Promise<PointCloudObjectAnnotationData>;
}
