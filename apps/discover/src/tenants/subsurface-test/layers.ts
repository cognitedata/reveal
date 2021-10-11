import { Layers } from '../types';

const MAP_DATA_URL = 'https://storage.googleapis.com/discover_layers_us/';

const layers: Layers = {
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
  fields: {
    local: `fields.json`,
    name: 'Fields',
    color: 'rgba(0, 172, 79, 0.8)',
    defaultOn: true,
    asset: {
      filter: ['Operator', 'Aker BP ASA'],
      displayField: 'Field',
    },
    searchable: 'Field',

    mapLayers: [
      {
        id: 'fields',
        source: 'fields',
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
      },
      {
        id: 'fieldsLabel',
        source: 'fields',
        type: 'symbol',
        minzoom: 6,
        layout: {
          'text-field': '{Field}',
          'text-font': ['Open Sans Semibold', 'Arial Unicode MS Bold'],
          'text-size': 12,
        },
      },
    ],
  },
};

export default layers;
