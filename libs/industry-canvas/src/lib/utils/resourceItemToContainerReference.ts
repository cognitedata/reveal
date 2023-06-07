import { ResourceItem } from '@cognite/data-exploration';

import { ContainerReference, ContainerReferenceType } from '../types';

const resourceItemToContainerReference = (
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

export default resourceItemToContainerReference;
