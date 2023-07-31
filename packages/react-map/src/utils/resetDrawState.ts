import { featureCollection } from '@turf/helpers';

import { MapAddedProps } from '../types';
import { drawModes } from '../FreeDraw';

export const resetDrawState = ({
  setSelectedFeatures,
  setDrawnFeatures,
  setDrawMode,
}: MapAddedProps) => {
  // console.log('Clearing all draw state');
  setSelectedFeatures([]);
  setDrawnFeatures(featureCollection([]));
  setDrawMode(drawModes.SIMPLE_SELECT);
};
