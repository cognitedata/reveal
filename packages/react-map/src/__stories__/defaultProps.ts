import { featureCollection } from '@turf/helpers';

import { drawModes } from '../FreeDraw';

export const props = {
  drawMode: drawModes.DIRECT_SELECT,
  events: [],
  features: featureCollection([], {}),

  layerConfigs: [],
  layerData: [],
  // selectedFeature: null,
  // selectedFeature: feature({
  //   type: 'Point',
  //   coordinates: [110, 50],
  // }),
  sources: [],

  MAPBOX_TOKEN: String(process.env.STORYBOOK_MAPBOX_TOKEN),
  MAPBOX_MAP_ID: String(process.env.STORYBOOK_MAPBOX_MAP_ID),
  // maxBounds:{undefined},
  center: [12, 60] as [number, number],
  zoom: 4,
  // renderNavigationControls:{renderNavigationControls}  ,
};
