import {
  useList,
  useCdfItems,
  useAggregate,
} from '@cognite/sdk-react-query-hooks';
import {
  ExternalId,
  Timeseries,
  Asset,
  CogniteEvent,
  Sequence,
  FileInfo as File,
} from '@cognite/sdk/dist/src';
import { ResourceType, ResourceItem, convertResourceType } from 'lib/types';
import { formatNumber } from 'lib/utils/numbers';

export type Relationship = {
  targetType: ResourceType;
  targetExternalId: string;
  sourceType: ResourceType;
  sourceExternalId: string;
};

export const useRelationships = (
  resourceExternalId?: string,
  types?: ResourceType[]
): { data: (ExternalId & { type: ResourceType })[]; isFetching: boolean } => {
  const {
    data: sourceRelationships = [],
    isFetching: isFetchingSource,
  } = useList<Relationship>(
    // @ts-ignore
    'relationships',
    {
      filter: { sourceExternalIds: [resourceExternalId], targetTypes: types },
    },
    { enabled: !!resourceExternalId, staleTime: 60 * 1000 }
  );

  const {
    data: targetRelationships = [],
    isFetching: isFetchingTarget,
  } = useList<Relationship>(
    // @ts-ignore
    'relationships',
    {
      filter: { targetExternalIds: [resourceExternalId], sourceTypes: types },
    },
    { enabled: !!resourceExternalId, staleTime: 60 * 1000 }
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
    isFetching: isFetchingSource && isFetchingTarget,
  };
};

export const useRelatedResources = (
  relations: (ExternalId & { type: ResourceType })[] | []
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
    enabled: relations.length > 0 && assetIds?.length > 0,
  });

  const eventIds = relations
    .filter(el => el.type === 'event')
    .map(({ externalId }) => ({ externalId }));
  const { data: events = [] } = useCdfItems<CogniteEvent>('events', eventIds, {
    enabled: relations.length > 0 && eventIds?.length > 0,
  });

  const fileIds = relations
    .filter(el => el.type === 'file')
    .map(({ externalId }) => ({ externalId }));
  const { data: files = [] } = useCdfItems<File>('files', fileIds, {
    enabled: relations.length > 0 && fileIds?.length > 0,
  });

  const sequenceIds = relations
    .filter(el => el.type === 'sequence')
    .map(({ externalId }) => ({ externalId }));
  const { data: sequences = [] } = useCdfItems<Sequence>(
    'sequences',
    sequenceIds,
    {
      enabled: relations.length > 0 && sequenceIds?.length > 0,
    }
  );

  const timeseriesIds = relations
    .filter(el => el.type === 'timeSeries')
    .map(({ externalId }) => ({ externalId }));
  const { data: timeseries = [] } = useCdfItems<Timeseries>(
    'timeseries',
    timeseriesIds,
    {
      enabled: relations.length > 0 && timeseriesIds?.length > 0,
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

export const useRelatedResourceCount = (
  resource: ResourceItem,
  type: ResourceType
): { count: string } => {
  const isAsset = resource.type === 'asset';

  const { data, isFetched } = useAggregate(
    convertResourceType(type),
    { assetSubtreeIds: [{ id: resource.id }] },
    { enabled: isAsset && !!resource.id }
  );

  const {
    data: relationships,
    isFetching: isFetchingRelationships,
  } = useRelationships(resource.externalId, [type]);

  let count: string = '0';
  if (isAsset && isFetched && data && !isFetchingRelationships) {
    count = formatNumber(data?.count + relationships.length);
  }

  if (!isFetchingRelationships && relationships?.length > 0) {
    count = formatNumber(relationships.length);
  }

  return { count };
};

export const useRelatedResourceCounts = (
  resource: ResourceItem
): { counts: { [key in ResourceType]: string } } => {
  const { count: asset } = useRelatedResourceCount(resource, 'asset');
  const { count: event } = useRelatedResourceCount(resource, 'event');
  const { count: file } = useRelatedResourceCount(resource, 'file');
  const { count: sequence } = useRelatedResourceCount(resource, 'sequence');
  const { count: timeSeries } = useRelatedResourceCount(resource, 'timeSeries');

  return {
    counts: {
      asset,
      event,
      file,
      sequence,
      timeSeries,
    },
  };
};
