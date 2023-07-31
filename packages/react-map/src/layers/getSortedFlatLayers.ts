import { MapLayer } from './types';

export const getSortedFlatLayers = <
  T extends {
    id: string;
    weight?: number;
    layers?: MapLayer[];
  }
>(
  layers: T[]
) => {
  // This extracts all the layers including child layers in to one array
  // so that we can then sort these child layers
  const flattenLayers = layers.reduce((result, layer) => {
    if (!layer.layers) {
      return result;
    }

    return [
      ...result,
      ...layer.layers.map((childLayer, index) => ({
        ...layer,
        layers: [childLayer],
        id: childLayer.id,
        // increment children layers
        weight: (childLayer.weight || layer.weight || 0) + index,
      })),
    ];
  }, [] as T[]);

  // sort the layers into the right order,
  // so then when adding to the map we only have to maintain this order
  // because mapbox only let's us set the 'before' layer
  // we have no other way to add a layer at a certian 'level'
  flattenLayers.sort((a, b) => {
    return (b.weight || 0) - (a.weight || 0);
  });

  return flattenLayers;
};
