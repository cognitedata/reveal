import { SelectableLayer } from '@cognite/react-map';

import { MapLayer } from 'tenants/types';

import {
  DEFAULT_COLOR,
  LIGHT_GREY,
  DARK_PURPLE,
  SEISMIC_LAYER_ID,
  SEISMIC_LINE_LAYER_ID,
  DOCUMENTS_CLUSTER_MARKER,
  WELLS_CLUSTER_MARKER,
  MIXED_CLUSTER_MARKER,
  GROUPED_CLUSTER_LAYER_ID,
  GROUPED_CLUSTER_COUNT_LAYER_ID,
  UNCLUSTERED_LAYER_ID,
} from '../constants';

/*
 * Helpfull links
 *
 * Paint info: https://docs.mapbox.com/mapbox-gl-js/style-spec/layers/#paint-property
 *
 *
 */

export function getStaticLayers(): SelectableLayer {
  const layers: MapLayer[] = [
    {
      id: SEISMIC_LAYER_ID,
      weight: 504,
      type: 'fill',
      source: SEISMIC_LAYER_ID,
      paint: {
        'fill-color': [
          'match',
          ['get', 'type'],
          'Preview',
          LIGHT_GREY,
          'Selected',
          DARK_PURPLE,
          DEFAULT_COLOR,
        ],
        'fill-outline-color': [
          'match',
          ['get', 'type'],
          'Preview',
          DEFAULT_COLOR,
          'Selected',
          DEFAULT_COLOR,
          DEFAULT_COLOR,
        ],
        'fill-opacity': 0.6,
      },
    },
    {
      id: SEISMIC_LINE_LAYER_ID,
      weight: 505,
      type: 'line',
      source: SEISMIC_LAYER_ID,
      paint: {
        'line-color': [
          'match',
          ['get', 'type'],
          'Preview',
          LIGHT_GREY,
          'Selected',
          DARK_PURPLE,
          DEFAULT_COLOR,
        ],
      },
      filter: ['==', '$type', 'LineString'],
    },

    {
      id: GROUPED_CLUSTER_LAYER_ID,
      weight: 5000,
      type: 'symbol',
      source: GROUPED_CLUSTER_LAYER_ID,
      filter: ['has', 'point_count'],
      layout: {
        'icon-image': [
          'case', // Begin case expression
          ['==', ['get', 'documentsCount'], ['get', 'point_count']], // if cluster has only documents, blue color circle
          DOCUMENTS_CLUSTER_MARKER,
          ['==', ['get', 'wellsCount'], ['get', 'point_count']], // if cluster has only wells, purple color circle
          WELLS_CLUSTER_MARKER,
          MIXED_CLUSTER_MARKER, // if the cluster has mixed data
        ],
        'icon-size': ['step', ['get', 'point_count'], 0.56, 10, 0.72, 100, 1],
        'icon-allow-overlap': true,
      },
      paint: {
        'icon-opacity': [
          'case',
          ['==', ['get', 'blurredItemsCount'], 0],
          1,
          ['>', ['get', 'selectedItemsCount'], 0],
          1,
          0.4,
        ],
      },
    },
    {
      id: GROUPED_CLUSTER_COUNT_LAYER_ID,
      weight: 5001,
      type: 'symbol',
      source: GROUPED_CLUSTER_LAYER_ID,
      filter: ['has', 'point_count'],
      layout: {
        'text-field': '{point_count_abbreviated}',
        'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
        'text-size': 14,
      },
      paint: {
        'text-color': '#ffffff',
      },
    },
    {
      id: UNCLUSTERED_LAYER_ID,
      weight: 5002,
      type: 'symbol',
      source: GROUPED_CLUSTER_LAYER_ID,
      filter: ['!', ['has', 'point_count']],
      layout: {
        'icon-image': ['get', 'iconType'] || 'hollow-marker',
        'icon-size': 1.1,
        'icon-allow-overlap': true,
      },
      paint: {
        'icon-opacity': ['case', ['==', ['get', 'isBlurred'], true], 0.4, 1],
      },
      maxzoom: 24,
      minzoom: 0,
    },
  ];

  return {
    id: 'staticLayers',
    name: 'Static Layers',
    selected: true,
    layers,
    weight: 1000,
  };
}
