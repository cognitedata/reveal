import type {
  CadDomainObject,
  PointCloudDomainObject,
  Image360CollectionDomainObject
} from '../../../architecture';

export type ModelLayerContent = {
  cadModels: CadDomainObject[];
  pointClouds: PointCloudDomainObject[];
  image360Collections: Image360CollectionDomainObject[];
};
