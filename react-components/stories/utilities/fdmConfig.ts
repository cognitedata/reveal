/*!
 * Copyright 2023 Cognite AS
 */
import { type FdmAssetMappingsConfig } from '../../src';

export const DefaultFdmConfig: FdmAssetMappingsConfig = {
  source: {
    space: 'hf_3d_schema',
    version: '1',
    type: 'view',
    externalId: 'cdf_3d_connection_data'
  },
  global3dSpace: 'hf_3d_global_data',
  assetFdmSpace: 'hf_customer_a'
};
