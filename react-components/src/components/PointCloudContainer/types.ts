/*!
 * Copyright 2024 Cognite AS
 */

import { type PointCloudAppearance, type DMInstanceRef } from '@cognite/reveal';

export type PointCloudVolumeStylingGroup = {
  pointCloudVolumes: Array<number | DMInstanceRef>;
  style: PointCloudAppearance;
};

export type PointCloudModelStyling = {
  defaultStyle?: PointCloudAppearance;
  groups?: PointCloudVolumeStylingGroup[];
};
