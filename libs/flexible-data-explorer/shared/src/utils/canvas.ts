import {
  ContainerReference,
  ContainerReferenceType,
  ResourceType,
} from '../types/canvas';

export type ResourceItem = {
  id: number;
  externalId?: string;
  type: ResourceType;
};

export const resourceItemToContainerReference = (
  resourceItem: ResourceItem
): ContainerReference => {
  if (resourceItem.type === 'timeSeries') {
    return {
      type: ContainerReferenceType.TIMESERIES,
      resourceId: resourceItem.id,
    };
  }

  if (resourceItem.type === 'file') {
    return {
      type: ContainerReferenceType.FILE,
      resourceId: resourceItem.id,
    };
  }

  if (resourceItem.type === 'asset') {
    return {
      type: ContainerReferenceType.ASSET,
      resourceId: resourceItem.id,
    };
  }

  if (resourceItem.type === 'event') {
    return {
      type: ContainerReferenceType.EVENT,
      resourceId: resourceItem.id,
    };
  }

  throw new Error('Unsupported resource type');
};
