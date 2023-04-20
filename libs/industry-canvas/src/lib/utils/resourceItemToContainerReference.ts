import { ResourceItem } from '@cognite/data-exploration';
import dayjs from 'dayjs';
import { v4 as uuid } from 'uuid';
import { ContainerReference, ContainerReferenceType } from '../types';

const resourceItemToContainerReference = (
  resourceItem: ResourceItem
): ContainerReference => {
  if (resourceItem.type === 'timeSeries') {
    return {
      type: ContainerReferenceType.TIMESERIES,
      id: uuid(),
      resourceId: resourceItem.id,
      startDate: dayjs(new Date())
        .subtract(2, 'years')
        .startOf('day')
        .toISOString(),
      endDate: dayjs(new Date()).toISOString(),
    };
  }

  if (resourceItem.type === 'file') {
    return {
      type: ContainerReferenceType.FILE,
      id: uuid(),
      resourceId: resourceItem.id,
      page: 1,
    };
  }

  if (resourceItem.type === 'asset') {
    return {
      type: ContainerReferenceType.ASSET,
      id: uuid(),
      resourceId: resourceItem.id,
    };
  }

  if (resourceItem.type === 'event') {
    return {
      type: ContainerReferenceType.EVENT,
      id: uuid(),
      resourceId: resourceItem.id,
    };
  }

  throw new Error('Unsupported resource type');
};

export default resourceItemToContainerReference;
