import { CogniteEvent } from '@cognite/sdk';
import { InternalEventsData } from 'app/domain/events/internal/types';

export const normalizeEvents = (
  items: CogniteEvent[]
): InternalEventsData[] => {
  return items.map(item => ({
    id: item.id,
    externalId: item.externalId,

    dataSetId: item.dataSetId,
    lastUpdatedTime: item.lastUpdatedTime,
    createdTime: item.createdTime,
    assetIds: item.assetIds,

    type: item.type,
    startTime: item.startTime,
    endTime: item.endTime,
    subtype: item.subtype,
    metadata: item.metadata,

    description: item.description,
  }));
};
