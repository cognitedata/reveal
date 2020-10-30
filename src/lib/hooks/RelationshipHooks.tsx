import { useList, useCdfItems } from '@cognite/sdk-react-query-hooks';
import {
  ExternalId,
  Timeseries,
  Asset,
  CogniteEvent,
  Sequence,
  FileInfo as File,
} from '@cognite/sdk/dist/src';
import { ResourceType } from 'lib/types';

export type Relationship = {
  targetType: ResourceType;
  targetExternalId: string;
  sourceType: ResourceType;
  sourceExternalId: string;
};

export const useRelationships = (
  resourceExternalId?: string
): { data: (ExternalId & { type: ResourceType })[] } => {
  const { data: sourceRelationships = [] } = useList<Relationship>(
    // @ts-ignore
    'relationships',
    {
      filter: { sourceExternalIds: [resourceExternalId] },
    },
    { enabled: !!resourceExternalId }
  );

  const { data: targetRelationships = [] } = useList<Relationship>(
    // @ts-ignore
    'relationships',
    {
      filter: { targetExternalIds: [resourceExternalId] },
    },
    { enabled: !!resourceExternalId }
  );

  return {
    data: [
      ...sourceRelationships.map(item => ({
        externalId: item.targetExternalId,
        type: item.targetType,
      })),
      ...targetRelationships.map(item => ({
        externalId: item.sourceExternalId,
        type: item.sourceType,
      })),
    ],
  };
};

export const useRelatedResources = (
  relations: (ExternalId & { type: ResourceType })[]
): {
  data: {
    asset: Asset[];
    event: CogniteEvent[];
    file: File[];
    sequence: Sequence[];
    timeSeries: Timeseries[];
  };
} => {
  const assetIds = relations
    .filter(el => el.type === 'asset')
    .map(({ externalId }) => ({ externalId }));
  const { data: assets = [] } = useCdfItems<Asset>('assets', assetIds, {
    enabled: relations && assetIds?.length > 0,
  });

  const eventIds = relations
    .filter(el => el.type === 'event')
    .map(({ externalId }) => ({ externalId }));
  const { data: events = [] } = useCdfItems<CogniteEvent>('events', eventIds, {
    enabled: relations && eventIds?.length > 0,
  });

  const fileIds = relations
    .filter(el => el.type === 'file')
    .map(({ externalId }) => ({ externalId }));
  const { data: files = [] } = useCdfItems<File>('files', fileIds, {
    enabled: relations && fileIds?.length > 0,
  });

  const sequenceIds = relations
    .filter(el => el.type === 'sequence')
    .map(({ externalId }) => ({ externalId }));
  const { data: sequences = [] } = useCdfItems<Sequence>(
    'sequences',
    sequenceIds,
    {
      enabled: relations && sequenceIds?.length > 0,
    }
  );

  const timeseriesIds = relations
    .filter(el => el.type === 'timeSeries')
    .map(({ externalId }) => ({ externalId }));
  const { data: timeseries = [] } = useCdfItems<Timeseries>(
    'timeseries',
    timeseriesIds,
    {
      enabled: relations && timeseriesIds?.length > 0,
    }
  );

  return {
    data: {
      asset: assets,
      event: events,
      file: files,
      sequence: sequences,
      timeSeries: timeseries,
    },
  };
};
