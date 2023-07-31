import * as React from 'react';
import noop from 'lodash/noop';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import isEmpty from 'lodash/isEmpty';

import { DrawMode, drawModes } from '../FreeDraw';
import { MapType, MapFeature } from '../types';

import { useDeepEffect } from './useDeep';

export const useDrawMode = ({
  map,
  draw,
  selectedFeatures,
}: {
  map?: MapType;
  draw?: MapboxDraw;
  selectedFeatures: MapFeature[];
}) => {
  const [drawMode, setDrawMode] = React.useState<DrawMode>(
    drawModes.SIMPLE_SELECT
  );

  useDeepEffect(() => {
    if (!map) return noop;
    if (!draw) return noop;

    const hasUserSelections = !isEmpty(selectedFeatures);
    if (hasUserSelections && drawMode === drawModes.SIMPLE_SELECT) {
      return noop;
    }

    if (drawMode === drawModes.DIRECT_SELECT) {
      const firstFeature = selectedFeatures[0];
      if (firstFeature) {
        draw.changeMode('direct_select', {
          featureId: String(firstFeature.id),
        });
        return noop;
      }

      draw.changeMode('simple_select');
      return noop;
    }

    const currentDrawMode = draw.getMode();
    const modeShowBeUpdated =
      currentDrawMode !== drawMode || drawMode !== drawModes.SIMPLE_SELECT;
    if (modeShowBeUpdated) {
      // @ts-expect-error No overload matches this call
      draw.changeMode(drawMode);
    }

    return noop;
  }, [drawMode, !!draw, selectedFeatures]);

  return { drawMode, setDrawMode };
};
