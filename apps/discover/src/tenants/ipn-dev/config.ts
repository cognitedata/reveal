import { defaultWellFilters } from 'tenants/config';
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
  },
  seismic: {
    metadata: {
      // [field from api result]: [display value]
      name: { displayName: 'Name', display: true },
    },
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
    trajectory: {
      enabled: true,
      normalizeColumns: {
        Depth: 'Depth',
        Inclination: 'Inclination',
        Azimuth: 'Azimuth',
        X_offset: 'X_offset',
        Y_offset: 'Y_offset',
        TVD: 'TVD',
      },

      charts: [
        {
          type: 'line',
          chartData: { x: 'X_offset', y: 'Y_offset' },
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
          chartData: { x: 'Y_offset', y: 'TVD' },
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
          chartData: { x: 'X_offset', y: 'TVD' },
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
          type: '3d',
          chartData: { x: 'X_offset', y: 'Y_offset', z: 'TVD' },
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
          chartData: { x: 'X_offset', y: 'Y_offset' },
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
        { externalId: 'Depth', valueType: 'DOUBLE', name: 'Depth' },
        { externalId: 'Azimuth', valueType: 'DOUBLE', name: 'Azimuth' },
        { externalId: 'Inclination', valueType: 'DOUBLE', name: 'Inclination' },
        { externalId: 'X_offset', valueType: 'DOUBLE', name: 'X_offset' },
        { externalId: 'Y_offset', valueType: 'DOUBLE', name: 'Y_offset' },
        { externalId: 'TVD', valueType: 'DOUBLE', name: 'TVD' },
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
    ...defaultWellFilters,
    field_block_operator_filter: {
      operator: {
        enabled: true,
      },
      field: {
        enabled: true,
      },
      block: {
        enabled: true,
      },
    },
    overview: {
      enabled: true,
    },
    relatedDocument: {
      enabled: true,
    },
  },
  sideBar: 2,
  externalLinks: {
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
