/*!
 * Copyright 2024 Cognite AS
 */
import {
  type CadLayersStateParam,
  type Image360LayersStateParam,
  type PointCloudLayersStateParam
} from '../../../hooks/types';

export type LayersStateParam = {
  image360Layers?: Image360LayersStateParam[];
  cadLayers?: CadLayersStateParam[];
  pointCloudLayers?: PointCloudLayersStateParam[];
};

export type DefaultLayersConfiguration = {
  cad: boolean;
  pointcloud: boolean;
  image360: boolean;
};
