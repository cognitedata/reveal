/*!
 * Copyright 2023 Cognite AS
 */

import { type DmsUniqueIdentifier, type Source } from './FdmSDK';

export const DEFAULT_QUERY_STALE_TIME = 1000 * 60 * 10; // 10 minutes

export const SYSTEM_SPACE_3D_SCHEMA = 'cdf_3d_schema';

export const INSTANCE_SPACE_3D_DATA = 'cog_3d_data';

export const SYSTEM_3D_EDGE_TYPE: DmsUniqueIdentifier = {
  externalId: 'cdf3dEntityConnection',
  space: SYSTEM_SPACE_3D_SCHEMA
};

export const SYSTEM_3D_EDGE_SOURCE: Source = {
  type: 'view',
  version: '1',
  externalId: 'Cdf3dConnectionProperties',
  space: SYSTEM_SPACE_3D_SCHEMA
};
