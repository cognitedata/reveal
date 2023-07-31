import { MapType } from '../types';

import { MapLayer } from './types';

const getLayer = (innerMap: MapType, layerId: string) => {
  return innerMap.getLayer(layerId);
};

export const addLayer = (
  innerMap: MapType,
  innerLayer: MapLayer,
  beforeLayer?: string
) => {
  // console.log('Adding before:', beforeLayer);
  let beforeLayerToUse;

  // Check if the layer is already added to map
  const innerLayerExist = getLayer(innerMap, innerLayer.id);
  // Check if the layer's source is already added to map
  const sourceExist = innerMap.getSource(innerLayer.source);
  // console.log('beforeLayerExist', beforeLayerExist);

  if (beforeLayer === undefined) {
    // this default will cause the first layer to be drawn before
    // the gl-draw ones, eg: the layers where we draw the user polygon
    const fallbackBeforeLayerName = 'gl-draw-polygon-fill-inactive.cold';
    const fallbackBeforeLayer = getLayer(innerMap, fallbackBeforeLayerName);
    if (fallbackBeforeLayer) {
      beforeLayerToUse = fallbackBeforeLayerName;
    }
  } else {
    // check if the layer has a before layer already added to the map
    const beforeLayerExist = getLayer(innerMap, beforeLayer);
    if (beforeLayerExist) {
      beforeLayerToUse = beforeLayer;
    }
  }

  if (!innerLayerExist && sourceExist) {
    try {
      innerMap.addLayer(innerLayer, beforeLayerToUse);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Layer not ready:', error);
    }
  }
};

export const removeLayer = (innerMap: MapType, layerId: string) => {
  if (getLayer(innerMap, layerId)) {
    innerMap.removeLayer(layerId);
  }
};
