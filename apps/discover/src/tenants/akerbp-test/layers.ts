import { Layers } from '../types';

export const MAP_DATA_URL =
  'https://storage.googleapis.com/ppoly_ui_map_json_daily_update/';

const layers: Layers = {
  wells: {
    remote: `${MAP_DATA_URL}Wells.json`,
    name: 'Wells',
    color: 'rgba(0, 0, 0, 1)',
    defaultOn: false,
    weight: 0,
    mapLayers: [
      {
        id: 'wells',
        source: 'wells',
        type: 'symbol',
        layout: {
          'text-field': 'B',
          'text-font': ['NPD_symbols Regular'],
          'text-size': 12,
        },
      },
      {
        id: 'wellsLabels',
        source: 'wells',
        type: 'symbol',
        minzoom: 8,
        layout: {
          'text-field': '{Well}',
          'text-font': ['Open Sans Semibold', 'Arial Unicode MS Bold'],
          'text-size': 12,
          'text-offset': [0, 1],
          'text-anchor': 'top',
        },
      },
    ],
  },
  akerBpFields: {
    remote: `${MAP_DATA_URL}Fields.json`,
    name: 'Fields Aker BP',
    color: 'rgba(0, 172, 79, 0.8)',
    defaultOn: true,
    weight: 1,
    asset: {
      filter: ['Operator', 'Aker BP ASA'],
      displayField: 'Field',
    },
    mapLayers: [
      {
        id: 'akerBpFields',
        source: 'akerBpFields',
        type: 'fill',
        layout: {},
        paint: {
          'fill-outline-color': '#000',
          'fill-color': [
            'match',
            ['get', 'Operator'],
            'Aker BP ASA',
            'rgba(0, 172, 79, 0.8)',
            'rgba(180, 183, 121, 0.8)',
          ],
        },
        filter: ['==', 'Operator', 'Aker BP ASA'],
      },
      {
        id: 'akerBpFieldsLabel',
        source: 'akerBpFields',
        type: 'symbol',
        minzoom: 6,
        layout: {
          'text-field': '{Field}',
          'text-font': ['Open Sans Semibold', 'Arial Unicode MS Bold'],
          'text-size': 12,
        },
        filter: ['==', 'Operator', 'Aker BP ASA'],
      },
    ],
  },

  akerBPLicense: {
    remote: `${MAP_DATA_URL}AkerBPLicense.json`,
    name: 'Licenses Aker BP',
    color: 'rgba(251, 59, 134, 0.8)',
    // AkerBPLicense: 'rgba(251, 176, 59, 0.8)',
    defaultOn: true,
    weight: 2,
    searchable: 'License',
    mapLayers: [
      {
        id: 'akerBPLicense',
        source: 'akerBPLicense',
        type: 'fill',
        layout: {},
        paint: {
          'fill-outline-color': '#000',
          'fill-color': [
            'match',
            ['get', 'Operator'],
            'AKER BP ASA',
            'rgba(251, 59, 134, 0.8)',
            'rgba(251, 176, 59, 0.8)',
          ],
        },
      },
      {
        id: 'akerBPLicenseLabel',
        source: 'akerBPLicense',
        type: 'symbol',
        minzoom: 6,
        layout: {
          'text-field': '{License}',
          'text-font': ['Open Sans Semibold', 'Arial Unicode MS Bold'],
          'text-size': 12,
        },
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
      },
    ],
  },
  otherFields: {
    name: 'Other fields',
    color: 'rgba(180, 183, 121, 0.8)',
    defaultOn: false,
    mapLayers: [
      {
        id: 'otherFields',
        source: 'akerBpFields',
        type: 'fill',
        layout: {},
        paint: {
          'fill-outline-color': '#000',
          'fill-color': [
            'match',
            ['get', 'Operator'],
            'Aker BP ASA',
            'rgba(0, 172, 79, 0.8)',
            'rgba(180, 183, 121, 0.8)',
          ],
        },
        filter: ['!=', 'Operator', 'Aker BP ASA'],
      },
      {
        id: 'otherFieldsLabel',
        source: 'akerBpFields',
        type: 'symbol',
        minzoom: 6,
        layout: {
          'text-field': '{Field}',
          'text-font': ['Open Sans Semibold', 'Arial Unicode MS Bold'],
          'text-size': 12,
        },
        filter: ['!=', 'Operator', 'Aker BP ASA'],
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
  npdFields: {
    name: 'Norwegian Petroleum Directorate',
    color: 'transparent',
    defaultOn: false,
    mapLayers: [],
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
      },
    ],
  },
};

export default layers;
