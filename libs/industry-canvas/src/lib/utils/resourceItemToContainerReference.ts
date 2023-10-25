import { ExtendedResourceItem } from '@data-exploration-lib/core';

import { ContainerReference, ContainerReferenceType } from '../types';

const resourceItemToContainerReference = (
  resourceItem: ExtendedResourceItem
): ContainerReference => {
  if (resourceItem.type === 'timeSeries') {
    if (resourceItem?.dateRange && resourceItem?.dateRange.length === 2) {
      return {
        type: ContainerReferenceType.TIMESERIES,
        resourceId: resourceItem.id,
        startDate: String(resourceItem?.dateRange[0]),
        endDate: String(resourceItem?.dateRange[1]),
      };
    }
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

  if (resourceItem.type === 'threeD') {
    if (resourceItem.subId === undefined) {
      throw new Error('subId cannot be undefined for threeD resources');
    }
    return {
      type: ContainerReferenceType.THREE_D,
      modelId: resourceItem.id,
      revisionId: resourceItem.subId,
      initialAssetId: resourceItem.selectedAssetId,
      camera: resourceItem.camera,
    };
  }

  throw new Error('Unsupported resource type');
};

export default resourceItemToContainerReference;
