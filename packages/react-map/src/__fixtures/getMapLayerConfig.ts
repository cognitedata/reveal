import { SelectableLayer } from '../layers';

export const getMapLayerConfig = (
  extras: Partial<SelectableLayer> = {}
): SelectableLayer => {
  return {
    id: 'quadrants',
    name: 'Quadrants',
    color: 'transparent',
    selected: true,
    weight: 90,
    layers: [
      {
        id: 'quadrantsLayer',
        maxzoom: 6,
        source: 'QuadrantsSource',
        type: 'line',
        layout: {},
        paint: { 'line-color': '#f11', 'line-opacity': 0.8 },
      },
    ],
    ...extras,
  };
};

export const getMapLayerConfigBlocks = (
  extras: Partial<SelectableLayer> = {}
): SelectableLayer => {
  return {
    id: 'blocks',
    name: 'Blocks',
    color: 'transparent',
    selected: true,
    weight: 100,
    layers: [
      {
        id: 'blocksOutline',
        minzoom: 6,
        source: 'BlocksSource',
        type: 'line',
        layout: {},
        paint: { 'line-color': '#1f1', 'line-opacity': 0.8 },
      },
      {
        id: 'blocksLabel',
        source: 'BlocksSource',
        type: 'symbol',
        minzoom: 7,
        maxzoom: 9.5,
        layout: {
          'text-field': '{blcName}',
          'text-font': ['Open Sans Semibold', 'Arial Unicode MS Bold'],
          'text-size': 10,
        },
        weight: 1006,
      },
    ],
    ...extras,
  };
};
