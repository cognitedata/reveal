import { Layers } from '../types';

const MAP_DATA_URL = 'https://storage.googleapis.com/discover_layers_us/';

const owaProdLayers = {
  Well_Path: {
    remote: `${MAP_DATA_URL}Well_Path.json`,
    name: 'Well Paths',
    id: 'Well_Path',
    color: 'transparent',
    defaultOn: true,
    mapLayers: [
      {
        id: 'Well_Path',
        source: 'Well_Path',
        type: 'line',
        layout: {},
        paint: { 'line-color': '#000', 'line-opacity': 0.8 },
      },
    ],
    weight: 100,
  },
  BP_Leases_Current: {
    remote: `${MAP_DATA_URL}BP_Leases_Current.json`,
    id: 'BP_Leases_Current',
    name: 'Leases',
    color: 'rgba(0, 155, 0, 0.8)',
    defaultOn: true,
    mapLayers: [
      {
        id: 'symbols',
        type: 'symbol',
        source: 'BP_Leases_Current',
        minzoom: 8,
        layout: {
          'icon-text-fit': 'width',
          'symbol-placement': 'point',
          'text-field': '{BLOCKNUM}',
        },
        weight: 99,
      },
      {
        id: 'BP_Leases_Current',
        source: 'BP_Leases_Current',
        type: 'fill',
        layout: {},
        paint: {
          'fill-outline-color': '#333',
          'fill-color': [
            'match',
            ['get', 'Operator'],
            ' BP ASA',
            'rgba(0, 155, 0, 0.8)',
            'rgba(0, 155, 0, 0.8)',
          ],
        },
        weight: 98,
      },
    ],
  },
  Deep_Water_Surface: {
    remote: `${MAP_DATA_URL}Deep_Water_Surface.json`,
    name: 'DW Surface',
    id: 'Deep_Water_Surface',
    color: 'rgba(0, 172, 79, 0.8)',
    defaultOn: false,
    mapLayers: [
      {
        id: 'Deep_Water_Surface',
        source: 'Deep_Water_Surface',
        type: 'fill',
        layout: {},
        paint: {
          'fill-outline-color': '#000',
          'fill-color': [
            'match',
            ['get', 'Operator'],
            ' BP ASA',
            'rgba(0, 172, 79, 0.8)',
            'rgba(0, 172, 79, 0.8)',
          ],
        },
      },
    ],
    weight: 97,
  },
  Deep_Water_Bottom_Hole_Wells: {
    remote: `${MAP_DATA_URL}Deep_Water_Bottom_Hole_Wells.json`,
    name: 'DW Bottom Hole Wells',
    id: 'Deep_Water_Bottom_Hole_Wells',
    color: 'rgba(152, 206, 0, 0.8)',
    defaultOn: false,
    mapLayers: [
      {
        id: 'Deep_Water_Bottom_Hole_Wells',
        source: 'Deep_Water_Bottom_Hole_Wells',
        type: 'fill',
        layout: {},
        paint: {
          'fill-outline-color': '#000',
          'fill-color': [
            'match',
            ['get', 'Operator'],
            ' BP ASA',
            'rgba(152, 206, 0, 0.8)',
            'rgba(152, 206, 0, 0.8)',
          ],
        },
      },
    ],
    weight: 96,
  },
  Deep_Water_Surface_Hole_Wells: {
    remote: `${MAP_DATA_URL}Deep_Water_Surface_Hole_Wells.json`,
    name: 'DW Surface Hole Wells',
    id: 'Deep_Water_Surface_Hole_Wells',
    color: 'rgba(255, 255, 0, 0.8)',
    defaultOn: false,
    mapLayers: [
      {
        id: 'Deep_Water_Surface_Hole_Wells',
        source: 'Deep_Water_Surface_Hole_Wells',
        type: 'fill',
        layout: {},
        paint: {
          'fill-outline-color': '#000',
          'fill-color': [
            'match',
            ['get', 'Operator'],
            ' BP ASA',
            'rgba(255, 255, 0, 0.8)',
            'rgba(255, 255, 0, 0.8)',
          ],
        },
      },
    ],
    weight: 95,
  },
  GoM_States: {
    remote: `${MAP_DATA_URL}GoM_States.json`,
    name: 'GoM States',
    id: 'GoM_States',
    color: 'transparent',
    defaultOn: false,
    mapLayers: [
      {
        id: 'GoM_States',
        source: 'GoM_States',
        type: 'line',
        layout: {},
        paint: { 'line-color': '#000', 'line-opacity': 0.8 },
      },
    ],
    weight: 94,
  },
  MMS_Protractions: {
    remote: `${MAP_DATA_URL}MMS_Protractions.json`,
    name: 'MMS Protractions',
    id: 'MMS_Protractions',
    color: 'transparent',
    defaultOn: false,
    mapLayers: [
      {
        id: 'MMS_Protractions',
        source: 'MMS_Protractions',
        type: 'line',
        layout: {},
        paint: { 'line-color': '#000', 'line-opacity': 0.8 },
      },
    ],
    weight: 93,
  },
} as Layers;

export default owaProdLayers;
