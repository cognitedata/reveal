const DARK_PURPLE = '#988998';
const LIGHT_GREY = '#efefef';

export function getMapStyles(theme) {
  return [
    {
      id: 'gl-draw-polygon-fill-inactive',
      type: 'fill',
      filter: [
        'all',
        ['==', 'active', 'false'],
        ['==', '$type', 'Polygon'],
        ['!=', 'mode', 'static'],
      ],
      paint: {
        'fill-color': [
          'match',
          ['get', 'user_type'],
          'Preview',
          LIGHT_GREY,
          'Selected',
          DARK_PURPLE,
          theme.palette.tertiery.main,
        ],
        'fill-outline-color': [
          'match',
          ['get', 'user_type'],
          'Preview',
          LIGHT_GREY,
          'Selected',
          DARK_PURPLE,
          theme.palette.tertiery.main,
        ],
        'fill-opacity': 0.1,
      },
      // source: 'mapbox-gl-draw-cold'
    },
    {
      id: 'gl-draw-polygon-fill-active',
      type: 'fill',
      filter: ['all', ['==', 'active', 'true'], ['==', '$type', 'Polygon']],
      paint: {
        'fill-color': theme.palette.secondary.main,
        'fill-outline-color': theme.palette.secondary.main,
        'fill-opacity': 0.1,
      },
      // source: 'mapbox-gl-draw-cold'
    },
    {
      id: 'gl-draw-polygon-midpoint',
      type: 'circle',
      filter: ['all', ['==', '$type', 'Point'], ['==', 'meta', 'midpoint']],
      paint: {
        'circle-radius': 3,
        'circle-color': theme.palette.secondary.main,
      },
      // source: 'mapbox-gl-draw-cold'
    },
    {
      id: 'gl-draw-polygon-stroke-inactive',
      type: 'line',
      filter: [
        'all',
        ['==', 'active', 'false'],
        ['==', '$type', 'Polygon'],
        ['!=', 'mode', 'static'],
      ],
      layout: {
        'line-cap': 'round',
        'line-join': 'round',
      },
      paint: {
        'line-color': [
          'match',
          ['get', 'user_type'],
          'Preview',
          LIGHT_GREY,
          'Selected',
          DARK_PURPLE,
          theme.palette.tertiery.main,
        ],
        'line-width': 2,
      },
      // source: 'mapbox-gl-draw-cold'
    },
    {
      id: 'gl-draw-polygon-stroke-active',
      type: 'line',
      filter: ['all', ['==', 'active', 'true'], ['==', '$type', 'Polygon']],
      layout: {
        'line-cap': 'round',
        'line-join': 'round',
      },
      paint: {
        'line-color': theme.palette.secondary.main,
        'line-dasharray': [0.2, 2],
        'line-width': 2,
      },
      // source: 'mapbox-gl-draw-cold'
    },
    {
      id: 'gl-draw-line-inactive',
      type: 'line',
      filter: [
        'all',
        ['==', 'active', 'false'],
        ['==', '$type', 'LineString'],
        ['!=', 'mode', 'static'],
      ],
      layout: {
        'line-cap': 'round',
        'line-join': 'round',
      },
      paint: {
        'line-color': theme.palette.tertiery.main,
        'line-width': 2,
      },
      // source: 'mapbox-gl-draw-cold'
    },
    {
      id: 'gl-draw-line-active',
      type: 'line',
      filter: ['all', ['==', '$type', 'LineString'], ['==', 'active', 'true']],
      layout: {
        'line-cap': 'round',
        'line-join': 'round',
      },
      paint: {
        'line-color': theme.palette.secondary.main,
        'line-dasharray': [0.2, 2],
        'line-width': 2,
      },
      // source: 'mapbox-gl-draw-cold'
    },
    {
      id: 'gl-draw-polygon-and-line-vertex-stroke-inactive',
      type: 'circle',
      filter: [
        'all',
        ['==', 'meta', 'vertex'],
        ['==', '$type', 'Point'],
        ['!=', 'mode', 'static'],
      ],
      paint: {
        'circle-radius': 6,
        'circle-color': theme.palette.secondary.text,
      },
      // source: 'mapbox-gl-draw-cold'
    },
    {
      id: 'gl-draw-polygon-and-line-vertex-inactive',
      type: 'circle',
      filter: [
        'all',
        ['==', 'meta', 'vertex'],
        ['==', '$type', 'Point'],
        ['!=', 'mode', 'static'],
      ],
      paint: {
        'circle-radius': 3,
        'circle-color': theme.palette.secondary.main,
      },
      // source: 'mapbox-gl-draw-cold'
    },
    {
      id: 'gl-draw-point-point-stroke-inactive',
      type: 'circle',
      filter: [
        'all',
        ['==', 'active', 'false'],
        ['==', '$type', 'Point'],
        ['==', 'meta', 'feature'],
        ['!=', 'mode', 'static'],
      ],
      paint: {
        'circle-radius': 5,
        'circle-opacity': 1,
        'circle-color': theme.palette.secondary.text,
      },
      // source: 'mapbox-gl-draw-cold'
    },
    {
      id: 'gl-draw-point-inactive',
      type: 'circle',
      filter: [
        'all',
        ['==', 'active', 'false'],
        ['==', '$type', 'Point'],
        ['==', 'meta', 'feature'],
        ['!=', 'mode', 'static'],
      ],
      paint: {
        'circle-radius': 3,
        'circle-color': theme.palette.tertiery.main,
      },
      // source: 'mapbox-gl-draw-cold'
    },
    {
      id: 'gl-draw-point-stroke-active',
      type: 'circle',
      filter: [
        'all',
        ['==', '$type', 'Point'],
        ['==', 'active', 'true'],
        ['!=', 'meta', 'midpoint'],
      ],
      paint: {
        'circle-radius': 7,
        'circle-color': theme.palette.secondary.text,
      },
      // source: 'mapbox-gl-draw-cold'
    },
    {
      id: 'gl-draw-point-active',
      type: 'circle',
      filter: [
        'all',
        ['==', '$type', 'Point'],
        ['!=', 'meta', 'midpoint'],
        ['==', 'active', 'true'],
      ],
      paint: {
        'circle-radius': 5,
        'circle-color': theme.palette.tertiery.main,
      },
      // source: 'mapbox-gl-draw-cold'
    },
    {
      id: 'gl-draw-polygon-fill-static',
      type: 'fill',
      filter: ['all', ['==', 'mode', 'static'], ['==', '$type', 'Polygon']],
      paint: {
        'fill-color': [
          'match',
          ['get', 'user_type'],
          'Preview',
          LIGHT_GREY,
          'Selected',
          DARK_PURPLE,
          theme.palette.tertiery.main,
        ],
        'fill-outline-color': [
          'match',
          ['get', 'user_type'],
          'Preview',
          LIGHT_GREY,
          'Selected',
          DARK_PURPLE,
          theme.palette.tertiery.main,
        ],
        'fill-opacity': 0.1,
      },
      // source: 'mapbox-gl-draw-cold'
    },

    {
      id: 'gl-draw-polygon-stroke-static',
      type: 'line',
      filter: ['all', ['==', 'mode', 'static'], ['==', '$type', 'Polygon']],
      layout: {
        'line-cap': 'round',
        'line-join': 'round',
      },
      paint: {
        'line-color': theme.palette.tertiery.main,
        'line-width': 2,
      },
      // source: 'mapbox-gl-draw-cold'
    },
    {
      id: 'gl-draw-line-static',
      type: 'line',
      filter: ['all', ['==', 'mode', 'static'], ['==', '$type', 'LineString']],
      layout: {
        'line-cap': 'round',
        'line-join': 'round',
      },
      paint: {
        'line-color': theme.palette.tertiery.main,
        'line-width': 2,
      },
      // source: 'mapbox-gl-draw-cold'
    },
    {
      id: 'gl-draw-point-static',
      type: 'circle',
      filter: ['all', ['==', 'mode', 'static'], ['==', '$type', 'Point']],
      paint: {
        'circle-radius': 5,
        'circle-color': theme.palette.tertiery.main,
      },
      // source: 'mapbox-gl-draw-cold'
    },
  ];
}
