import {
  CadDomainObject,
  Image360CollectionDomainObject,
  PointCloudDomainObject,
  RevealDomainObject
} from '../../../architecture';
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

export type ModelLayerHandlers = {
  cadHandlers: CadDomainObject[];
  pointCloudHandlers: PointCloudDomainObject[];
  image360Handlers: Image360CollectionDomainObject[];
};
