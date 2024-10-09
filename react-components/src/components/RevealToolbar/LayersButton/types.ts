/*!
 * Copyright 2024 Cognite AS
 */
import {
  type CadLayersUrlStateParam,
  type Image360LayersUrlStateParam,
  type PointCloudLayersUrlStateParam
} from '../../../hooks/types';

export type LayersUrlStateParam = {
  image360Layers?: Image360LayersUrlStateParam[];
  cadLayers?: CadLayersUrlStateParam[];
  pointCloudLayers?: PointCloudLayersUrlStateParam[];
};

export type DefaultLayersConfiguration = {
  cad: boolean;
  pointcloud: boolean;
  image360: boolean;
};
