import { TenantConfig } from 'tenants/types';

import config, { testAzureConfig } from './config';

/**
 * Config changes for Discover e2e projects should be done here.
 * This is to sync the project config between Discover e2e projects.
 * This config is currently shared between `discover-e2e-bluefield` and `discover-e2e-azure-dev` projects.
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
  showDynamicResultCount: false,
};

export default defaultTestConfig;
