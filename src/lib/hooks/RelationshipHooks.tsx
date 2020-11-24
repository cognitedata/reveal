import {
  useList,
  useCdfItems,
  useAggregate,
  useInfiniteList,
} from '@cognite/sdk-react-query-hooks';
import { ResourceType, ResourceItem, convertResourceType } from 'lib/types';
import { formatNumber } from 'lib/utils/numbers';
import { useMemo } from 'react';
import {
  ExternalId,
  Asset,
  CogniteEvent,
  Sequence,
  Timeseries,
  FileInfo,
} from '@cognite/sdk';

const PAGE_SIZE = 20;

type Resource = FileInfo | Asset | CogniteEvent | Sequence | Timeseries;

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

export const useInfiniteRelationshipsList = <T extends Resource>(
  resourceExternalId?: string,
  type?: ResourceType,
  enabled: boolean = true
) => {
  const fetchEnabled = enabled && !!resourceExternalId;

  const { data: sourceData = [], ...sourceParams } = useInfiniteList<
    Relationship
  >(
    // @ts-ignore
    'relationships',
    PAGE_SIZE,
    { sourceExternalIds: [resourceExternalId], targetTypes: [type] },
    { enabled: fetchEnabled, staleTime: 60 * 1000 }
  );
  const sourceItems = useMemo(
    () =>
      sourceData?.reduce(
        (accl, t) =>
          accl.concat(
            t.items.map(({ targetExternalId: externalId }) => ({ externalId }))
          ),
        [] as ExternalId[]
      ),
    [sourceData]
  );
  const { data: sourceResources = [] } = useCdfItems<T>(
    convertResourceType(type!),
    sourceItems,
    {
      enabled: sourceItems.length > 0,
    }
  );

  const fetchTarget = !!sourceParams && !sourceParams.canFetchMore;

  const { data: targetData = [], ...targetParams } = useInfiniteList<
    Relationship
  >(
    // @ts-ignore
    'relationships',
    PAGE_SIZE,
    { targetExternalIds: [resourceExternalId], sourceTypes: [type] },
    {
      enabled: fetchEnabled && fetchTarget,
      staleTime: 60 * 1000,
    }
  );
  const targetItems = useMemo(
    () =>
      targetData?.reduce(
        (accl, t) =>
          accl.concat(
            t.items.map(({ sourceExternalId: externalId }) => ({ externalId }))
          ),
        [] as ExternalId[]
      ),
    [targetData]
  );
  const { data: targetResources = [] } = useCdfItems<T>(
    convertResourceType(type!),
    targetItems,
    {
      enabled: targetItems.length > 0,
    }
  );

  const rest = sourceParams.canFetchMore ? sourceParams : targetParams;

  return {
    items: [...sourceResources, ...targetResources] as T[],
    ...rest,
  };
};

export const useRelationshipCount = (
  resource: ResourceItem,
  type: ResourceType
): number => {
  const {
    data: relationships,
    isFetching: isFetchingRelationships,
  } = useRelationships(resource.externalId, [type]);

  let count = 0;
  if (!isFetchingRelationships && relationships?.length > 0) {
    count = relationships.length;
  }

  return count;
};

export const useRelatedResourceCount = (
  resource: ResourceItem,
  type: ResourceType
): { count: string } => {
  const isAsset = resource.type === 'asset';

  const { data, isFetched } = useAggregate(
    convertResourceType(type),
    { assetSubtreeIds: [{ id: resource.id }] },
    { enabled: isAsset && !!resource.id, staleTime: 60 * 1000 }
  );

  const {
    data: relationships,
    isFetching: isFetchingRelationships,
  } = useRelationships(resource.externalId, [type]);

  let count: string = '0';
  if (isAsset && isFetched && data && !isFetchingRelationships) {
    count = formatNumber(data?.count + relationships.length);
  } else if (!isFetchingRelationships && relationships?.length > 0) {
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
