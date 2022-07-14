import isFunction from 'lodash/isFunction';

import { isLayerEmpty } from './isLayerEmpty';

export const getLayersByKey = <T>(
  allLayers: Record<string, T>,
  key: keyof T,
  value?: unknown
) => {
  return Object.keys(allLayers).reduce((result, id) => {
    if (
      isFunction(value)
        ? value(allLayers[id][key]) // check the layers value in a custom function
        : allLayers[id][key] === value // or just check its value directly
    ) {
      const layer = allLayers[id];

      // stop adding layers that dont have data
      // note: we should move this check somewhere else when we fix up this function
      // eg: removing the 'selected' etc
      if (isLayerEmpty(layer)) {
        // console.log('Skipping layer:', id);
        return result;
      }

      result.push(layer);
    }

    return result;
  }, [] as T[]);
};
