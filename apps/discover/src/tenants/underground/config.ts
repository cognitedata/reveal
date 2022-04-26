import { defaultWellFilters, testAzureConfig } from 'tenants/config';
import { TenantConfig } from 'tenants/types';

import config from '../config';

const defaultConfig: TenantConfig = {
  ...config, // Contain common configurations for all tenants
  // searchableLayerTitle: '',
  map: {
    zoom: 4,
    center: [0, 68],
    cluster: true,
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
    trajectory: {
      enabled: true,
      normalizeColumns: {
        x_offset: 'x_offset',
        md: 'md',
        inclination: 'inclination',
        tvd: 'tvd',
        y_offset: 'y_offset',
        azimuth: 'azimuth',
        ed: 'equivalent_departure',
      },

      charts: [
        {
          type: 'line',
          chartData: { x: 'x_offset', y: 'y_offset' },
          chartExtraData: {
            hovertemplate: `%{y}`,
          },
          chartVizData: {
            axisNames: {
              x: 'East West (<%= unit %>)',
              y: 'North South (<%= unit %>)',
            },
            title: 'NS vs EW',
          },
        },
        {
          type: 'line',
          chartData: { x: 'y_offset', y: 'tvd' },
          chartExtraData: {
            hovertemplate: `%{y}`,
          },
          chartVizData: {
            axisNames: {
              x: 'North South (<%= unit %>)',
              y: 'True Vertical Depth (<%= unit %>)',
            },
            title: 'TVD vs NS',
          },
        },
        {
          type: 'line',
          chartData: { x: 'x_offset', y: 'tvd' },
          chartExtraData: {
            hovertemplate: `%{y}`,
          },
          chartVizData: {
            axisNames: {
              x: 'East West (<%= unit %>)',
              y: 'True Vertical Depth (<%= unit %>)',
            },
            title: 'TVD vs EW',
          },
        },
        {
          type: 'line',
          chartData: { x: 'ed', y: 'tvd' },
          chartExtraData: {
            hovertemplate: `%{y}`,
          },
          chartVizData: {
            axisNames: {
              x: 'Equivalent_Departure (<%= unit %>)',
              y: 'True Vertical Depth (<%= unit %>)',
            },
            title: 'TVD vs ED',
          },
        },
        {
          type: '3d',
          chartData: { x: 'x_offset', y: 'y_offset', z: 'tvd' },
          chartExtraData: {
            hovertemplate: `EW: %{x}<br>NS: %{y}<br>TVD: %{z}`,
          },
          chartVizData: {
            axisNames: {
              x: 'East West (<%= unit %>)',
              y: 'North South (<%= unit %>)',
              z: 'TVD (<%= unit %>)',
            },
            title: 'TVD 3D view',
          },
        },
        {
          type: 'legend',
          chartData: { x: 'x_offset', y: 'y_offset' },
          chartExtraData: {
            hovertemplate: `%{y}`,
          },
          chartVizData: {
            axisNames: { x: 'East West', y: 'North South', z: 'TVD' },
            title: '',
          },
        },
      ],

      columns: [
        { externalId: 'md', valueType: 'DOUBLE', name: 'md' },
        { externalId: 'azimuth', valueType: 'DOUBLE', name: 'azimuth' },
        { externalId: 'inclination', valueType: 'DOUBLE', name: 'inclination' },
        { externalId: 'tvd', valueType: 'DOUBLE', name: 'tvd' },
        { externalId: 'x_offset', valueType: 'DOUBLE', name: 'x_offset' },
        { externalId: 'y_offset', valueType: 'DOUBLE', name: 'y_offset' },
        {
          externalId: 'equivalent_departure',
          valueType: 'DOUBLE',
          name: 'equivalent_departure',
        },
      ],

      queries: [
        {
          filter: {
            metadata: {
              type: 'Trajectory',
              object_state: 'ACTUAL',
            },
          },
        },
      ],
    },
    nds: {
      enabled: true,
    },
    npt: {
      enabled: true,
    },
    ...defaultWellFilters,
    ppfg: {
      enabled: true,
      tvdColumn: 'TVD',
      fetch: (client, filters = {}) => {
        return client.sequences.search({
          filter: {
            metadata: {
              type: 'Depthlogs',
              datasetname: 'ds-BP-ppfg',
            },
            ...filters,
          },
        });
      },
    },
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
              source: 'Petrel',
              type: 'Depthlogs',
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
    casing: {
      enabled: true,
      queries: [
        {
          metadata: {
            type: 'Casing',
            assy_type: 'Casing',
            object_state: 'ACTUAL',
            assy_report_type: 'CASING',
          },
        },
      ],
    },
    digitalRocks: {
      enabled: false,
    },
  },
  seismic: {
    disabled: false,
  },
  companyInfo: {
    name: 'Cognite',
    logo: 'aa.png',
  },
  azureConfig: {
    ...testAzureConfig,
  },
};

export default defaultConfig;
