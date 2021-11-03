import { defaultWellsConfig, testAzureConfig } from 'tenants/config';
import { TenantConfig } from 'tenants/types';

import config from '../config';

const defaultConfig: TenantConfig = {
  ...config, // Contain common configurations for all tenants
  map: {
    zoom: 6,
    center: [5, 61],
  },
  documents: {
    disabled: false,
    showGeometryOnMap: true,
    extractByFilepath: true,
    filters: {},
  },
  wells: {
    filters: {},
    wellbores: {
      fetch: (client, filters = {}) => {
        return client.assets.list({
          filter: {
            metadata: {
              type: 'Wellbore',
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
              type: 'FormationTops',
            },
          },
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
  sideBar: 2,
  externalLinks: {
    // eslint-disable-next-line lodash/prefer-constant
    hasWellProductionData: () =>
      'https://app.powerbi.com/groups/5e138d2c-cd5e-477f-9840-7f02f8c9a6f2/reports/61f91bdd-7af0-4ac8-bfa0-7de24f1fd267/ReportSection?noSignUpCheck=1',
    hasProductionData: (field?: string) => {
      if (field === 'SNORRE') {
        return `https://app.powerbi.com/groups/5e138d2c-cd5e-477f-9840-7f02f8c9a6f2/reports/aaf15ed0-30bd-4236-8750-f8eff525b197/ReportSection798d9037caecb76f3610?filter=Final/Field in ('Snorre A','Snorre B')`;
      }

      return `https://app.powerbi.com/groups/5e138d2c-cd5e-477f-9840-7f02f8c9a6f2/reports/aaf15ed0-30bd-4236-8750-f8eff525b197/ReportSection798d9037caecb76f3610?filter=Final/Field eq '${field}'`;
    },
  },
};

export default defaultConfig;
