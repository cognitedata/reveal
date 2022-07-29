import { defaultWellFilters } from 'tenants/config';
import { TenantConfig } from 'tenants/types';

import config from '../config';

const defaultConfig: TenantConfig = {
  ...config, // Contain common configurations for all tenants
  searchableLayerTitle: 'Search in AkerBP licenses',
  map: {
    zoom: 4,
    center: [0, 68],
  },
  documents: {
    extractByFilepath: true,
  },
  seismic: {
    metadata: {
      // timeDepth: 'Time/Depth',
      // fileSize: 'File size',
      diskos_id: { display: true, displayName: 'File name', width: 150 },
      dimension: { display: true, displayName: 'Survey type', width: 100 },
      data_type: { display: true, displayName: 'Migration' },
      processing: { display: true, displayName: 'Processing' },
      processing_year: { display: true, displayName: 'Year' },
      offset: { display: true, displayName: 'Offset' },
      source: { display: true, displayName: 'Source' },
    },
  },
  wells: {
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
        x_offset: 'OFFSET_EAST',
        md: 'MD',
        inclination: 'INCLINATION',
        tvd: 'TVD',
        y_offset: 'OFFSET_NORTH',
        azimuth: 'AZIMUTH',
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
        { name: 'MD_DSDSUNIT', externalId: 'MD_DSDSUNIT', valueType: 'STRING' },
        { name: 'OFFSET_EAST', externalId: 'OFFSET_EAST', valueType: 'DOUBLE' },
        {
          name: 'INCLINATION_DSDSUNIT',
          externalId: 'INCLINATION_DSDSUNIT',
          valueType: 'STRING',
        },
        {
          name: 'TVD_DSDSUNIT',
          externalId: 'TVD_DSDSUNIT',
          valueType: 'STRING',
        },
        {
          name: 'DOGLEG_SEVERITY_DSDSUNIT',
          externalId: 'DOGLEG_SEVERITY_DSDSUNIT',
          valueType: 'STRING',
        },
        { name: 'MD', externalId: 'MD', valueType: 'DOUBLE' },
        { name: 'INCLINATION', externalId: 'INCLINATION', valueType: 'DOUBLE' },
        {
          name: 'DOGLEG_SEVERITY',
          externalId: 'DOGLEG_SEVERITY',
          valueType: 'DOUBLE',
        },
        { name: 'TVD', externalId: 'TVD', valueType: 'DOUBLE' },
        {
          name: 'AZIMUTH_DSDSUNIT',
          externalId: 'AZIMUTH_DSDSUNIT',
          valueType: 'STRING',
        },
        {
          name: 'OFFSET_NORTH',
          externalId: 'OFFSET_NORTH',
          valueType: 'DOUBLE',
        },
        { name: 'AZIMUTH', externalId: 'AZIMUTH', valueType: 'DOUBLE' },
      ],

      queries: [
        {
          filter: {
            metadata: {
              type: 'DefinitiveSurvey',
            },
          },
        },
      ],
    },
    // 3d: {
    //   enabled: false,
    // },
    ppfg: {
      enabled: false,
    },
    geomechanic: {
      enabled: false,
    },
    nds: {
      enabled: false,
    },
    npt: {
      enabled: false,
    },
    ...defaultWellFilters,
    logs: {
      enabled: true,
      types: ['logsFrmTops', 'logs', 'logs'],
      queries: [
        {
          filter: {
            metadata: {
              source: 'DISKOS',
              type: 'FormationTops',
            },
          },
        },
        {
          filter: {
            metadata: {
              type: 'Logs',
              subtype: 'MudLog',
            },
          },
        },
        {
          filter: {
            metadata: {
              type: 'Logs',
              subtype: 'WellLog',
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
      enabled: false,
      queries: [
        {
          metadata: {
            source: 'EDM',
            type: 'Casing',
          },
        },
      ],
    },
    digitalRocks: {
      enabled: false,
    },

    // filters: {
    //   source: 'DISKOS',
    // },
  },
  azureConfig: {
    instrumentationKey: 'b90f62cf-5eee-45e8-839a-2c3e84f82399',
  },
};

export default defaultConfig;
