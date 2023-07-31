import { MapDataSource } from '../types';

export const getLayerById = (allLayers: MapDataSource[], id: string) =>
  allLayers.find((layer) => layer.id === id);
