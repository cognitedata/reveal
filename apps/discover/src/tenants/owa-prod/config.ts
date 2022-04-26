import { defaultWellFilters } from 'tenants/config';
import { TenantConfig } from 'tenants/types';

import config from '../config';

const defaultConfig: TenantConfig = {
  ...config, // Contain common configurations for all tenants
  // searchableLayerTitle: '',
  map: {
    zoom: 6,
    center: [-90, 27],
  },
  documents: {
    defaultLimit: 100,
    wellboreSchematics: {
      supportedFileTypes: ['PDF', 'IMAGE'],
    },
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
    overview: {
      enabled: true,
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
      defaultCurves: [
        'FP_Composite_High',
        'FP_Composite_Low',
        'FP_Composite_Medium',
        'PNORM',
        'PP_Composite_High',
        'PP_Composite_Low',
        'PP_Composite_Medium',
        'S_VERT',
      ],
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
    geomechanic: {
      enabled: true,
      fetch: (client, filters = {}) => {
        return client.sequences
          .search({
            filter: {
              metadata: {
                type: 'Depthlogs',
              },
              ...filters,
            },
            search: {
              description: 'Geomechanic*',
            },
          })
          .then((geomechanics) =>
            geomechanics.filter((geomechanic) =>
              geomechanic.description?.startsWith('Geomechanic')
            )
          );
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
    fit: {
      enabled: true,
      fieldInfo: {
        tvd: 'metadata.lot_tvd',
        tvdUnit: 'metadata.lot_tvd_unit',
        pressure: 'metadata.weight_lot_emw',
        pressureUnit: 'metadata.weight_lot_emw_unit',
      },
      fetch: (client, filters = {}) => {
        return client.sequences.search({
          filter: {
            metadata: {
              type: 'FormationTest',
              test_type: 'FIT',
            },
            ...filters,
          },
        });
      },
    },
    lot: {
      enabled: true,
      fieldInfo: {
        tvd: 'metadata.lot_tvd',
        tvdUnit: 'metadata.lot_tvd_unit',
        pressure: 'metadata.weight_lot_emw',
        pressureUnit: 'metadata.weight_lot_emw_unit',
      },
      fetch: (client, filters = {}) => {
        return client.sequences.search({
          filter: {
            metadata: {
              type: 'FormationTest',
              test_type: 'LOT',
            },
            ...filters,
          },
        });
      },
    },
    relatedDocument: {
      enabled: true,
    },
    threeDee: {
      enabled: true,
    },
    digitalRocks: {
      enabled: false,
      metaInfo: {
        createdTmeFormat: 'YYYYMMDD_HHmmss',
      },
      fetch: (client, filters = {}) => {
        return client.assets.search({
          filter: {
            metadata: {
              type: 'Digital Rock',
            },
            ...filters,
          },
        });
      },
      digitalRockSampleFetch: (client, filters = {}) => {
        return client.assets.search({
          filter: {
            metadata: {
              type: 'Digital Rock Sample',
            },
            ...filters,
          },
        });
      },
      gpartFetch: (client, filters = {}) => {
        return client.sequences.search({
          filter: {
            metadata: {
              type: 'Grain Partitioning',
            },
            ...filters,
          },
        });
      },
    },
  },
  seismic: {
    disabled: true,
  },
  companyInfo: {
    name: 'BP',
    logo: 'owa-test.png',
  },
  azureConfig: {
    enabled: true,
    instrumentationKey: 'c7841af5-2231-4757-ad62-bcfdd824529c',
  },
};

export default defaultConfig;
