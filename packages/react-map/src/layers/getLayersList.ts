import { Layers } from './types';

export const getLayersList = (layers: Layers) =>
  Object.keys(layers).map((id) => layers[id]);
