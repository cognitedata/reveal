import {
  type CadDomainObject,
  type Image360CollectionDomainObject,
  type PointCloudDomainObject
} from '../../../architecture';
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

export type ModelLayerContent = {
  cadModels: CadDomainObject[];
  pointClouds: PointCloudDomainObject[];
  image360Collections: Image360CollectionDomainObject[];
};
