import * as React from 'react';
import mapboxgl from 'maplibre-gl';

import { useDeepEffect } from './useDeep';

export const useResizeAware = ({
  map,
  mapRef,
}: {
  map?: mapboxgl.Map;
  mapRef: React.MutableRefObject<any>;
}) => {
  useDeepEffect(() => {
    // This is needed to resize the map when the parent container changes size (e.g expanded mode)
    if (map) {
      map.resize();
    }
  }, [!!map, mapRef?.current?.offsetWidth]);
};
