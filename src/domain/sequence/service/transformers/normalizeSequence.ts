import { Sequence } from '@cognite/sdk';
import { InternalSequenceData } from 'domain/sequence';

export const normalizeSequence = (
  items: Sequence[]
): InternalSequenceData[] => {
  return items.map(item => ({
    id: item.id,
    lastUpdatedTime: item.lastUpdatedTime,
    createdTime: item.createdTime,
    name: item.name,
    description: item.description,
    assetId: item.assetId,
    dataSetId: item.dataSetId,
    externalId: item.externalId,
    metadata: item.metadata,
    columns: item.columns,
  }));
};
