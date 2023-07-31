import { TenantConfig } from 'tenants/types';

import config, { testAzureConfig } from './config';

/**
 * Config changes for tests should be done here.
 * This config is shared between `discover-e2e-bluefield` and `discover-e2e-azure-dev` tenants in sync.
 */
const defaultTestConfig: TenantConfig = {
  ...config,

  azureConfig: {
    ...testAzureConfig,
  },

  // Override the default config
  wells: {
    overview: {
      enabled: true,
    },
    trajectory: {
      enabled: true,
    },
    data_source_filter: {
      enabled: true,
    },
    field_block_operator_filter: {
      field: {
        enabled: true,
      },
      block: {
        enabled: true,
      },
      operator: {
        enabled: true,
      },
    },
  },

  showProjectConfig: true,
};

export default defaultTestConfig;
