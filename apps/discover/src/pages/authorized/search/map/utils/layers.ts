import findLast from 'lodash/findLast';
import isFunction from 'lodash/isFunction';
import isUndefined from 'lodash/isUndefined';

import { SelectableLayer, MapDataSource } from 'modules/map/types';
import { Layer, Layers } from 'tenants/types';

/*
 * When adding layers we need to do it in the right order
 * This function helps us find the previous showing one
 * so we can position our new layer to show above or below that
 *
 */
export const choosePreviousSelectedLayer = (
  layers: SelectableLayer[],
  currentIndex: number
) => {
  const allLayersBeforeThisOne = layers.slice(0, currentIndex);
  const previous = findLast(allLayersBeforeThisOne, 'selected');
  return previous?.id;
};

export const getLayerById = (allLayers: MapDataSource[], id: string) =>
  allLayers.find((layer) => layer.id === id);

const isLayerEmpty = (layer: Layer) => {
  // layers from project config will have disabled set
  if (isUndefined(layer.disabled)) {
    return !layer.remote && !layer.local && !layer.remoteService;
  }

  return layer.disabled;
};

export const getLayersByKey = (
  allLayers: Layers,
  key: keyof Layer,
  value?: unknown
) => {
  return Object.keys(allLayers).reduce((result, id) => {
    if (
      isFunction(value)
        ? value(allLayers[id][key]) // check the layers value in a custom function
        : allLayers[id][key] === value // or just check its value directly
    ) {
      const layer = allLayers[id] as Layer;

      // stop adding layers that dont have data
      // note: we should move this check somewhere else when we fix up this function
      // eg: removing the 'selected' etc
      if (isLayerEmpty(layer)) {
        // console.log('Skipping layer:', id);
        return result;
      }

      result.push({
        id,
        name: layer.name,
        weight: layer.weight,
        selected: layer.defaultOn,

        layers: layer.mapLayers || [],
      });
    }

    return result;
  }, [] as SelectableLayer[]);
};

export const getBaseLayers = (allLayers: Layers) =>
  getLayersByKey(allLayers, 'alwaysOn', true);

// layer helpers, for later use.
// export const removeEmptyLayers = (layers: Layer[]) =>
//   layers.filter((layer) => isLayerEmpty(layer));

// layer helpers, for later use.
export const getLayersList = (layers: Layers) =>
  Object.keys(layers).map((id) => layers[id]);
