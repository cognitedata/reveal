/*!
 * Copyright 2022 Cognite AS
 */

import { ModelIdentifier } from '@reveal/modeldata-api';
import { PointCloudObjectAnnotationData } from './PointCloudObjectAnnotationData';

export interface IAnnotationProvider {
  getAnnotations(modelIdentifier: ModelIdentifier): Promise<PointCloudObjectAnnotationData>;
};
