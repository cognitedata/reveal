import mapboxgl from 'maplibre-gl';
import type { MapboxOptions } from 'maplibre-gl';
import isArray from 'lodash/isArray';

import { useDeepEffect } from './useDeep';

export interface FlyToProps {
  map?: mapboxgl.Map;
  flyTo?: {
    center: MapboxOptions['center'];
    zoom?: MapboxOptions['zoom'];
  };
}

export const useFlyTo = ({ map, flyTo }: FlyToProps) => {
  // Add zoom if it exists. (note: cannot do zoom:0 with this)
  useDeepEffect(() => {
    if (!flyTo || !map) {
      return;
    }

    let safe = true;

    if (isArray(flyTo.center)) {
      if (flyTo.center[1] < -90 || flyTo.center[1] > 90) {
        // eslint-disable-next-line no-console
        console.warn('Error in y when changing map to:', flyTo);
        safe = false;
      }
      if (flyTo.center[0] < -180 || flyTo.center[0] > 180) {
        // eslint-disable-next-line no-console
        console.warn('Error in x when changing map to:', flyTo);
        safe = false;
      }
    }

    if (safe) {
      map.flyTo({
        ...(flyTo.zoom && { zoom: flyTo.zoom }),
        center: flyTo.center,
      });
    }
  }, [!!map, flyTo]);
};
