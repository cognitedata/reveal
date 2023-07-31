import * as React from 'react';

import { MapType } from '../types';

import { useDeepEffect } from './useDeep';

/**
 * Resize the map when the parent container changes size (e.g expanded mode)
 */
export const useResizeAware = ({
  map,
  mapRef,
}: {
  map?: MapType;
  mapRef: React.MutableRefObject<any>;
}) => {
  useDeepEffect(() => {
    if (map) {
      map.resize();
    }
    // mapRef is needed to trigger the resize
  }, [!!map, mapRef?.current?.offsetWidth]);
};
