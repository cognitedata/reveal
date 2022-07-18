/*!
 * Copyright 2022 Cognite AS
 */

import { PointCloudMetadata } from './PointCloudMetadata';
import { PotreeNodeWrapper } from './PotreeNodeWrapper';

export interface PointCloudFactory {
  createModel(modelMetadata: PointCloudMetadata): Promise<PotreeNodeWrapper>;
}
