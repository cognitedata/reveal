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
