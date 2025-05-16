/*!
 * Copyright 2024 Cognite AS
 */

import { ViewReference } from '@cognite/sdk';

export const CORE_DM_SPACE = 'cdf_cdm';
export const CORE_DM_3D_CONTAINER_SPACE = 'cdf_cdm_3d';

export const COGNITE_POINT_CLOUD_VOLUME_SOURCE = {
  externalId: 'CognitePointCloudVolume',
  space: CORE_DM_SPACE,
  version: 'v1',
  type: 'view'
} as const satisfies ViewReference;

export const COGNITE_ASSET_SOURCE = {
  externalId: 'CogniteAsset',
  space: CORE_DM_SPACE,
  version: 'v1',
  type: 'view'
} as const satisfies ViewReference;

export const COGNITE_VISUALIZABLE_SOURCE = {
  externalId: 'CogniteVisualizable',
  space: CORE_DM_SPACE,
  version: 'v1',
  type: 'view'
} as const satisfies ViewReference;

export const COGNITE_3D_REVISION_SOURCE = {
  externalId: 'Cognite3DRevision',
  space: CORE_DM_SPACE,
  version: 'v1',
  type: 'view'
} as const satisfies ViewReference;

export const COGNITE_360_IMAGE_SOURCE = {
  externalId: 'Cognite360Image',
  space: CORE_DM_SPACE,
  version: 'v1',
  type: 'view'
} as const satisfies ViewReference;
