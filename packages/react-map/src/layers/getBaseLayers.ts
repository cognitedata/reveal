import { getLayersByKey } from './getLayersByKey';

export const getBaseLayers = <T extends Record<string, { alwaysOn?: boolean }>>(
  allLayers: T
) => getLayersByKey(allLayers, 'alwaysOn', true);

export const getBaseLayersArray = <T extends { alwaysOn?: boolean }[]>(
  allLayers: T
) => allLayers.filter((layer) => layer.alwaysOn) as T;
