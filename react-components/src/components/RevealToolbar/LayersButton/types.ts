import {
  type CadLayersUrlStateParam,
  type Image360LayersUrlStateParam,
  type PointCloudLayersUrlStateParam
} from '../../../hooks/types';

import {
  type CadModelHandler,
  type Image360CollectionHandler,
  type PointCloudModelHandler
} from './ModelHandler';

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

export type ModelLayerHandlers = {
  cadHandlers: CadModelHandler[];
  pointCloudHandlers: PointCloudModelHandler[];
  image360Handlers: Image360CollectionHandler[];
};
