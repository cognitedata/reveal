import { TenantConfig } from 'tenants/types';

import config, { testAzureConfig, defaultWellsConfig } from './config';

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
    data_source_filter: {
      enabled: true,
    },
    nds: {
      enabled: true,
    },
    npt: {
      enabled: true,
    },
    field_block_operator_filter: {
      field: {
        enabled: true,
      },
      region: {
        enabled: true,
      },
      block: {
        enabled: true,
      },
      operator: {
        enabled: true,
      },
    },
    well_characteristics_filter: {
      md: {
        enabled: true,
      },
      kb_elevation: {
        enabled: true,
      },
      tvd: {
        enabled: true,
      },
      dls: {
        enabled: true,
        feetDistanceInterval: 30,
        meterDistanceInterval: 100,
      },
    },
    trajectory: defaultWellsConfig.wells?.trajectory,
    casing: defaultWellsConfig.wells?.casing,
  },

  documents: config.documents
    ? {
        ...config.documents,
        mapLayerFilters: {
          discoveries: {
            labelAccessor: 'Discovery',
          },
        },
      }
    : undefined,

  showProjectConfig: true,
  showDynamicResultCount: false,
};

export default defaultTestConfig;
