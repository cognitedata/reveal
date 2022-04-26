import { testAzureConfig } from 'tenants/config';
import { TenantConfig } from 'tenants/types';

const defaultConfig: TenantConfig = {
  map: {
    zoom: 4,
    center: [12, 55],
  },
  documents: {
    defaultLimit: 100,
  },
  wells: {
    filters: {},
    wellbores: {
      fetch: (client, filters = {}) => {
        return client.assets.list({
          filter: {
            metadata: {
              type: 'wellbore',
            },
            ...filters,
          },
          limit: 1000,
        });
      },
    },
  },
  azureConfig: {
    ...testAzureConfig,
  },
};

export default defaultConfig;
