import mapboxgl from 'maplibre-gl';
import noop from 'lodash/noop';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import { Feature } from '@turf/helpers';

import { DrawMode, drawModes } from '../FreeDraw';

import { useDeepEffect } from './useDeep';

export const useDrawMode = ({
  map,
  draw,
  drawMode,
  selectedFeatures,
}: {
  map?: mapboxgl.Map;
  draw?: MapboxDraw;
  drawMode: DrawMode;
  selectedFeatures: Feature[];
}) => {
  useDeepEffect(() => {
    if (!map) return noop;
    if (!draw) return noop;

    if (selectedFeatures.length > 0 && drawMode === drawModes.SIMPLE_SELECT)
      return noop;

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

    const currentDrawmode = draw.getMode();
    if (currentDrawmode !== drawMode || drawMode !== drawModes.SIMPLE_SELECT) {
      // @ts-expect-error No overload matches this call
      draw.changeMode(drawMode);
    }

    return noop;
  }, [drawMode, !!draw, selectedFeatures.length]);
};
