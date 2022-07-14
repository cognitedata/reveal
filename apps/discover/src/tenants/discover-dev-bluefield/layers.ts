const MAP_DATA_URL = 'https://storage.googleapis.com/discover_layers_us/';

export const AKER_BP_DATA_URL = `${MAP_DATA_URL}akerbp/`;

const layers = {
  quadrants: {
    remote: `${MAP_DATA_URL}Quadrants.json`,
    id: 'quadrants',
    name: 'Quadrants',
    color: 'grey',
    defaultOn: true,
    weight: 90,
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
