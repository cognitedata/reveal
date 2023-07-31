import { isLayerEmpty } from './isLayerEmpty';
import { Layer } from './types';

export const removeEmptyLayers = (layers: Layer[]) =>
  layers.filter((layer) => isLayerEmpty(layer));
