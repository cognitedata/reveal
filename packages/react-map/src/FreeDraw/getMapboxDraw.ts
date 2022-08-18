import MapboxDraw from '@mapbox/mapbox-gl-draw';

import { getMapStyles } from './style';
import { FreeDraw } from './FreeDraw';

export const getMapboxDraw = () => {
  const mapboxDraw = new MapboxDraw({
    userProperties: true,
    displayControlsDefault: false,
    styles: [...getMapStyles()],
    modes: {
      draw_free_polygon: FreeDraw,
      ...MapboxDraw.modes,
    },
    controls: {},
  });

  return mapboxDraw;
};
