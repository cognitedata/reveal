import { Layers } from '../types';

const MAP_DATA_URL = 'https://storage.googleapis.com/discover_layers_us/';

const layers: Layers = {
  lundinFields: {
    remote: `${MAP_DATA_URL}Fields.json`,
    name: 'Fields Lundin',
    color: 'rgba(0, 172, 79, 0.8)',
    defaultOn: true,
    asset: {
      filter: [
        'Field',
        [
          'ALVHEIM',
          'BRYNHILD',
          'BØYLA',
          'EDVARD GRIEG',
          'GAUPE',
          'IVAR AASEN',
          'JOHAN SVERDRUP',
          'SOLVEIG',
          'VOLUND',
        ],
      ],
      displayField: 'Field',
    },
    mapLayers: [
      {
        id: 'lundinFields',
        source: 'lundinFields',
        type: 'fill',
        layout: {},
        paint: {
          'fill-outline-color': '#000',
          'fill-color': [
            'match',
            ['get', 'Operator'],
            'Lundin Norway AS',
            'rgba(0, 172, 79, 0.8)',
            'rgba(180, 183, 121, 0.8)',
          ],
        },
        filter: [
          'in',
          ['get', 'Field'],
          [
            'literal',
            [
              'ALVHEIM',
              'BRYNHILD',
              'BØYLA',
              'EDVARD GRIEG',
              'GAUPE',
              'IVAR AASEN',
              'JOHAN SVERDRUP',
              'SOLVEIG',
              'VOLUND',
            ],
          ],
        ],
      },
      {
        id: 'lundinFieldsLabel',
        source: 'lundinFields',
        type: 'symbol',
        minzoom: 6,
        layout: {
          'text-field': '{Field}',
          'text-font': ['Open Sans Semibold', 'Arial Unicode MS Bold'],
          'text-size': 12,
        },
        filter: [
          'in',
          ['get', 'Field'],
          [
            'literal',
            [
              'ALVHEIM',
              'BRYNHILD',
              'BØYLA',
              'EDVARD GRIEG',
              'GAUPE',
              'IVAR AASEN',
              'JOHAN SVERDRUP',
              'SOLVEIG',
              'VOLUND',
            ],
          ],
        ],
        weight: 1008,
      },
    ],
  },
  lundinWellbores: {
    remote: `${MAP_DATA_URL}lundin/wlbPoint.geojson`,
    name: 'Lundin Wellbores',
    color: 'red',
    defaultOn: true,
    mapLayers: [
      {
        id: 'lundinWellbores',
        source: 'lundinWellbores',
        type: 'circle',
        minzoom: 7,
        paint: {
          'circle-color': '#222',
          'circle-radius': 2,
          'circle-blur': 0.1,
          'circle-stroke-color': '#eee',
        },
      },
      {
        id: 'lundinWellboresLabel',
        source: 'lundinWellbores',
        type: 'symbol',
        minzoom: 8,
        layout: {
          'text-field': '{well_name}',
          'text-font': ['Open Sans Semibold', 'Arial Unicode MS Bold'],
          'text-size': 12,
          'text-offset': [0, 1],
        },
        weight: 1007,
      },
    ],
  },
  prlAreaCurrent: {
    remote: `${MAP_DATA_URL}lundin/prlAreaCurrent.geojson`,
    name: 'PRL Area Current',
    color: 'rgba(0, 172, 79, 0.8)',
    defaultOn: false,
    mapLayers: [
      {
        id: 'prlAreaCurrent',
        source: 'prlAreaCurrent',
        type: 'fill',
        layout: {},
        paint: {
          'fill-outline-color': '#000',
          'fill-color': 'rgba(0, 172, 79, 0.8)',
        },
      },
      {
        id: 'prlAreaCurrentLabel',
        source: 'prlAreaCurrent',
        type: 'symbol',
        minzoom: 6,
        layout: {
          'text-field': '{idLicence}',
          'text-font': ['Open Sans Semibold', 'Arial Unicode MS Bold'],
          'text-size': 12,
        },
        weight: 1006,
      },
    ],
  },
  // prlAreaSplitByBlock: {
  //   remote: `${MAP_DATA_URL}lundin/prlAreaSplitByBlock.geojson`,
  //   name: 'PRL Area Split By Block',
  //   color: 'rgba(0, 172, 79, 0.8)',
  //   defaultOn: false,
  //   mapLayers: [
  //     {
  //       id: 'prlAreaSplitByBlock',
  //       source: 'prlAreaSplitByBlock',
  //       type: 'fill',
  //       layout: {},
  //       paint: {
  //         'fill-outline-color': '#000',
  //         'fill-color': 'rgba(0, 172, 79, 0.8)',
  //       },
  //     },
  //     {
  //       id: 'prlAreaSplitByBlockLabel',
  //       source: 'prlAreaSplitByBlock',
  //       type: 'symbol',
  //       minzoom: 6,
  //       layout: {
  //         'text-field': '{idLicence}',
  //         'text-font': ['Open Sans Semibold', 'Arial Unicode MS Bold'],
  //         'text-size': 12,
  //       },
  //     },
  //   ],
  // },
  qadArea: {
    remote: `${MAP_DATA_URL}lundin/qadArea.geojson`,
    name: 'QAD Area',
    color: 'rgba(0, 172, 79, 0.8)',
    defaultOn: false,
    mapLayers: [
      {
        id: 'qadArea',
        source: 'qadArea',
        type: 'fill',
        layout: {},
        paint: {
          'fill-outline-color': '#000',
          'fill-color': 'rgba(0, 172, 79, 0.8)',
        },
      },
    ],
  },
  blkArea: {
    remote: `${MAP_DATA_URL}lundin/blkArea.geojson`,
    name: 'Block Area',
    color: 'rgba(0, 172, 79, 0.8)',
    defaultOn: false,
    mapLayers: [
      {
        id: 'blkArea',
        source: 'blkArea',
        type: 'fill',
        layout: {},
        paint: {
          'fill-outline-color': '#000',
          'fill-color': 'rgba(0, 172, 79, 0.8)',
        },
        weight: 1001,
      },
      {
        id: 'blkAreaLabel',
        source: 'blkArea',
        type: 'symbol',
        minzoom: 6,
        layout: {
          'text-field': '{block_name}',
          'text-font': ['Open Sans Semibold', 'Arial Unicode MS Bold'],
          'text-size': 12,
        },
        weight: 1000,
      },
    ],
  },
  otherLicenses: {
    remote: `${MAP_DATA_URL}OtherLicense.json`,
    name: 'Other licenses',
    color: 'rgba(0, 0, 0, 0.6)',
    defaultOn: false,
    mapLayers: [
      {
        id: 'otherLicenses',
        source: 'otherLicenses',
        type: 'fill',
        layout: {},
        paint: { 'fill-color': 'rgba(0, 0, 0, 0.6)' },
      },
      {
        id: 'otherLicensesLabel',
        source: 'otherLicenses',
        type: 'symbol',
        minzoom: 6,
        layout: {
          'text-field': '{License}',
          'text-font': ['Open Sans Semibold', 'Arial Unicode MS Bold'],
          'text-size': 12,
        },
        weight: 1003,
      },
    ],
  },
  structuralElements: {
    remote: `${MAP_DATA_URL}StructuralElements.json`,
    name: 'Structural elements',
    color: 'transparent',
    defaultOn: false,
    mapLayers: [
      {
        id: 'structuralElements',
        source: 'structuralElements',
        type: 'fill',
        layout: {},
        paint: {
          'fill-color': [
            'match',
            ['get', 'Topography'],
            'Cretaceous High',
            '#c8ffca',
            'Deep Cretaceous Basin',
            '#95ca00',
            'Marginal Volcanic High',
            '#ce99ff',
            'Orogenic belt',
            '#f5a37b',
            'Palaeozoic High in Platform',
            '#959595',
            'Platform',
            '#9dcdfa',
            'Pre-Jurassic Basin in Platform',
            '#c3cfdc',
            'Shallow Cretaceous Basin in Platform',
            '#80bdff',
            'Terraces and Intra-Basinal Elevations',
            '#279d64',
            'Volcanics',
            '#cdcef9',
            '#723122',
          ],
          'fill-opacity': 0.75,
        },
      },
    ],
  },
  discoveries: {
    remote: `${MAP_DATA_URL}Discoveries.json`,
    name: 'Discoveries',
    color: 'rgba(183, 102, 25, 0.8)',
    defaultOn: false,
    mapLayers: [
      {
        id: 'discoveries',
        source: 'discoveries',
        type: 'fill',
        layout: {},
        paint: {
          'fill-outline-color': '#000',
          'fill-color': 'rgba(183, 102, 25, 0.8)',
        },
      },
      {
        id: 'discoveriesLabel',
        source: 'discoveries',
        type: 'symbol',
        minzoom: 6,
        layout: {
          'text-field': '{Discovery}',
          'text-font': ['Open Sans Semibold', 'Arial Unicode MS Bold'],
          'text-size': 12,
        },
        weight: 1004,
      },
    ],
  },
  blocks: {
    remote: `${MAP_DATA_URL}Blocks.json`,
    name: 'Blocks',
    color: 'transparent',
    defaultOn: true,
    alwaysOn: true,
    mapLayers: [
      {
        id: 'blocks',
        minzoom: 6,
        source: 'blocks',
        type: 'line',
        layout: {},
        paint: { 'line-color': '#fff', 'line-opacity': 0.8 },
      },
      {
        id: 'blocksLabel',
        source: 'blocks',
        type: 'symbol',
        minzoom: 7,
        maxzoom: 9.5,
        layout: {
          'text-field': '{blcName}',
          'text-font': ['Open Sans Semibold', 'Arial Unicode MS Bold'],
          'text-size': 10,
        },
        weight: 1005,
      },
    ],
  },
  quadrants: {
    remote: `${MAP_DATA_URL}Quadrants.json`,
    name: 'Quadrants',
    color: 'transparent',
    defaultOn: true,
    alwaysOn: true,
    mapLayers: [
      {
        id: 'quadrants',
        maxzoom: 6,
        source: 'quadrants',
        type: 'line',
        layout: {},
        paint: { 'line-color': '#fff', 'line-opacity': 0.8 },
      },
    ],
  },
};

export default layers;
