/*!
 * Copyright 2024 Cognite AS
 */

import type { ViewReference } from '@cognite/sdk';

export const CORE_DM_SPACE = 'cdf_cdm';
export const CORE_DM_3D_CONTAINER_SPACE = 'cdf_cdm_3d';

export const COGNITE_POINT_CLOUD_VOLUME_SOURCE: {
    readonly externalId: "CognitePointCloudVolume";
    readonly space: "cdf_cdm";
    readonly version: "v1";
    readonly type: "view";
} = {
  externalId: 'CognitePointCloudVolume',
  space: CORE_DM_SPACE,
  version: 'v1',
  type: 'view'
} as const satisfies ViewReference;

export const COGNITE_ASSET_SOURCE: {
    readonly externalId: "CogniteAsset";
    readonly space: "cdf_cdm";
    readonly version: "v1";
    readonly type: "view";
} = {
  externalId: 'CogniteAsset',
  space: CORE_DM_SPACE,
  version: 'v1',
  type: 'view'
} as const satisfies ViewReference;

export const COGNITE_VISUALIZABLE_SOURCE: {
    readonly externalId: "CogniteVisualizable";
    readonly space: "cdf_cdm";
    readonly version: "v1";
    readonly type: "view";
} = {
  externalId: 'CogniteVisualizable',
  space: CORE_DM_SPACE,
  version: 'v1',
  type: 'view'
} as const satisfies ViewReference;

export const COGNITE_3D_REVISION_SOURCE: {
    readonly externalId: "Cognite3DRevision";
    readonly space: "cdf_cdm";
    readonly version: "v1";
    readonly type: "view";
} = {
  externalId: 'Cognite3DRevision',
  space: CORE_DM_SPACE,
  version: 'v1',
  type: 'view'
} as const satisfies ViewReference;

export const COGNITE_360_IMAGE_SOURCE: {
    readonly externalId: "Cognite360Image";
    readonly space: "cdf_cdm";
    readonly version: "v1";
    readonly type: "view";
} = {
  externalId: 'Cognite360Image',
  space: CORE_DM_SPACE,
  version: 'v1',
  type: 'view'
} as const satisfies ViewReference;

export const COGNITE_360_IMAGE_COLLECTION_SOURCE: {
    readonly externalId: "Cognite360ImageCollection";
    readonly space: "cdf_cdm";
    readonly version: "v1";
    readonly type: "view";
} = {
  externalId: 'Cognite360ImageCollection',
  space: CORE_DM_SPACE,
  version: 'v1',
  type: 'view'
} as const satisfies ViewReference;

export const COGNITE_360_IMAGE_STATION_SOURCE: {
    readonly externalId: "Cognite360ImageStation";
    readonly space: "cdf_cdm";
    readonly version: "v1";
    readonly type: "view";
} = {
  externalId: 'Cognite360ImageStation',
  space: CORE_DM_SPACE,
  version: 'v1',
  type: 'view'
} as const satisfies ViewReference;

export const MAX_DMS_QUERY_LIMIT = 10000;

export const DEFAULT_360_IMAGE_MIME_TYPE = 'image/jpeg' as const;
