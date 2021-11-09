import { defaultWellsConfig, testAzureConfig } from 'tenants/config';
import { TenantConfig } from 'tenants/types';

const defaultConfig: TenantConfig = {
  map: {
    zoom: 4,
    center: [12, 55],
  },
  documents: {
    defaultLimit: 100,
    filters: {},
    mapLayerFilters: {
      discoveries: {
        labelAccessor: 'Discovery',
      },
    },
  },
  enableWellSDKV3: true,
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
    overview: defaultWellsConfig.wells?.overview,
    trajectory: defaultWellsConfig.wells?.trajectory,
    logs: {
      enabled: true,
      types: ['logsFrmTops', 'logs'],
      queries: [
        {
          filter: {
            metadata: {
              source: 'Petrel',
              type: 'FormationTops',
            },
          },
          exclude: 'GOLD',
        },
        {
          filter: {
            metadata: {
              subtype: 'CompositeLog',
            },
          },
        },
      ],
      tracks: [
        { name: 'GR', enabled: true },
        { name: 'MD', enabled: true },
        { name: 'TVD', enabled: true },
        { name: 'FRM', enabled: true },
        { name: 'RDEEP', enabled: true },
        { name: 'D&N', enabled: true },
        { name: 'NDS', enabled: true },
        { name: 'PPFG', enabled: true },
      ],
    },
  },
  azureConfig: {
    ...testAzureConfig,
  },
};

export default defaultConfig;
