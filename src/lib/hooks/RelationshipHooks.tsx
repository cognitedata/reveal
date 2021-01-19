import {
  useList,
  useCdfItems,
  useAggregate,
  useInfiniteList,
  useCdfItem,
  usePermissions,
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
import {
  annotationInteralIdFilter,
  annotationExternalIdFilter,
} from 'lib/utils/filters';
import {
  ANNOTATION_METADATA_PREFIX as PREFIX,
  ANNOTATION_EVENT_TYPE,
  CURRENT_VERSION,
} from '@cognite/annotations';
import uniqueBy from 'lodash/uniqBy';

const PAGE_SIZE = 20;

export type Resource = FileInfo | Asset | CogniteEvent | Sequence | Timeseries;

export type Relationship = {
  targetType: ResourceType;
  targetExternalId: string;
  sourceType: ResourceType;
  sourceExternalId: string;
};

export const useRelationships = (externalId?: string, type?: ResourceType) => {
  const {
    data: hasRelationshipRead,
    isFetched: permissionFetched,
  } = usePermissions('relationshipsAcl', 'READ');
  const enabled = !!(permissionFetched && hasRelationshipRead && !!externalId);

  const sourceRelationships = useList<Relationship>(
    // @ts-ignore
    'relationships',
    {
      filter: {
        sourceExternalIds: [externalId],
        targetTypes: type ? [type] : undefined,
      },
    },
    { enabled, staleTime: 60 * 1000 }
  );

  const targetRelationships = useList<Relationship>(
    // @ts-ignore
    'relationships',
    {
      filter: {
        targetExternalIds: [externalId],
        sourceTypes: type ? [type] : undefined,
      },
    },
    { enabled, staleTime: 60 * 1000 }
  );

  const data = (sourceRelationships.data || [])
    .map(item => ({
      externalId: item.targetExternalId,
      type: item.targetType,
    }))
    .concat(
      (targetRelationships.data || []).map(item => ({
        externalId: item.sourceExternalId,
        type: item.sourceType,
      }))
    );

  return {
    data,
    isFetching:
      sourceRelationships.isFetching || targetRelationships.isFetching,
    isFetched: sourceRelationships.isFetched && targetRelationships.isFetched,
    isError: sourceRelationships.isError || targetRelationships.isError,
  };
};

export const useInfiniteRelationshipsList = <T extends Resource>(
  resourceExternalId?: string,
  type?: ResourceType,
  enabled: boolean = true
) => {
  const fetchEnabled = enabled && !!resourceExternalId;

  const { data: sourceData, ...sourceParams } = useInfiniteList<Relationship>(
    // @ts-ignore
    'relationships',
    PAGE_SIZE,
    { sourceExternalIds: [resourceExternalId], targetTypes: [type] },
    { enabled: fetchEnabled, staleTime: 60 * 1000 }
  );
  const sourceItems = useMemo(
    () =>
      sourceData?.pages?.reduce(
        (accl, t) =>
          accl.concat(
            t.items.map(({ targetExternalId: externalId }) => ({ externalId }))
          ),
        [] as ExternalId[]
      ) || ([] as ExternalId[]),
    [sourceData]
  );
  const { data: sourceResources = [] } = useCdfItems<T>(
    convertResourceType(type!),
    sourceItems,
    {
      enabled: sourceItems.length > 0,
    }
  );

  const fetchTarget = !!sourceParams && !sourceParams.hasNextPage;

  const { data: targetData, ...targetParams } = useInfiniteList<Relationship>(
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
      targetData?.pages?.reduce(
        (accl, t) =>
          accl.concat(
            t.items.map(({ sourceExternalId: externalId }) => ({ externalId }))
          ),
        [] as ExternalId[]
      ) || ([] as ExternalId[]),
    [targetData]
  );
  const { data: targetResources = [] } = useCdfItems<T>(
    convertResourceType(type!),
    targetItems,
    {
      enabled: targetItems.length > 0,
    }
  );

  const rest = sourceParams.hasNextPage ? sourceParams : targetParams;

  return {
    items: [...sourceResources, ...targetResources] as T[],
    ...rest,
  };
};

export const useAnnotations = (
  fileId: number,
  resourceType?: ResourceType,
  enabled = true
) => {
  const { data: file = {} } = useCdfItem<{ externalId?: string }>(
    'files',
    { id: fileId },
    { enabled }
  );

  const byInternalId = useList<CogniteEvent>('events', {
    filter: annotationInteralIdFilter(fileId, resourceType),
  });

  const byExternalId = useList<CogniteEvent>(
    'events',
    {
      filter: annotationExternalIdFilter(file.externalId!, resourceType),
    },
    { enabled: !!file.externalId }
  );

  const annotations = useMemo(
    () =>
      uniqueBy(
        [...(byExternalId.data || []), ...(byInternalId.data || [])].filter(
          ({ metadata = {} }) => metadata[`${PREFIX}_status`] !== 'deleted'
        ),
        'metadata.CDF_ANNOTATION_box'
      ),
    [byInternalId.data, byExternalId.data]
  );

  return {
    data: annotations,
    isFetched:
      byInternalId.isFetched && (byExternalId.isFetched || !file.externalId),
    isError: byInternalId.isError || byExternalId.isError,
    isFetching: byInternalId.isFetching || byExternalId.isFetching,
  };
};

export const useFilesAnnotatedWithResource = (
  resource: ResourceItem,
  enabled = true
) => {
  const byInternalId = useList<CogniteEvent>(
    'events',
    {
      filter: {
        type: ANNOTATION_EVENT_TYPE,
        metadata: {
          [`${PREFIX}version`]: `${CURRENT_VERSION}`,
          [`${PREFIX}resource_id`]: `${resource.id}`,
          [`${PREFIX}resource_type`]: `${resource.type}`,
        },
      },
    },
    { enabled }
  );

  const byExternalId = useList<CogniteEvent>(
    'events',
    {
      filter: {
        type: ANNOTATION_EVENT_TYPE,
        metadata: {
          [`${PREFIX}version`]: `${CURRENT_VERSION}`,
          [`${PREFIX}resource_external_id`]: `${resource.externalId}`,
          [`${PREFIX}resource_type`]: `${resource.type}`,
        },
      },
    },
    { enabled: enabled && !!resource.externalId }
  );

  const annotations = useMemo(
    () =>
      uniqueBy(
        [...(byExternalId.data || []), ...(byInternalId.data || [])].filter(
          ({ metadata = {} }) => metadata[`${PREFIX}_status`] !== 'deleted'
        ),
        'metadata.CDF_ANNOTATION_box'
      ),
    [byInternalId.data, byExternalId.data]
  );

  return {
    data: annotations,
    isFetched:
      byInternalId.isFetched &&
      (byExternalId.isFetched || !resource.externalId),
    isError: byInternalId.isError || byExternalId.isError,
    isFetching: byInternalId.isFetching || byExternalId.isFetching,
  };
};

export const useRelationshipCount = (
  resource: ResourceItem,
  type: ResourceType
) => {
  const { data: relationships, isFetched, ...rest } = useRelationships(
    resource.externalId,
    type
  );

  let count = 0;
  if (isFetched && relationships?.length > 0) {
    count = relationships.length;
  }

  return { data: count, isFetched, ...rest };
};

export const useAnnotationCount = (
  fileId: number,
  resourceType: ResourceType,
  enabled = true
) => {
  const { data: annotations, ...rest } = useAnnotations(
    fileId,
    resourceType,
    enabled
  );

  const ids = useMemo(
    () =>
      new Set(
        annotations
          .map(
            ({ metadata = {} }) =>
              metadata[`${PREFIX}resource_external_id`] ||
              metadata[`${PREFIX}resource_id`]
          )
          .filter(Boolean)
      ),
    [annotations]
  );

  let count = 0;
  if (ids.size > 0) {
    count = ids.size;
  }
  return { data: count, ...rest };
};

export const useFilesAnnotatedWithResourceCount = (
  resource: ResourceItem,
  enabled = true
) => {
  const { data: annotations, ...rest } = useFilesAnnotatedWithResource(
    resource,
    enabled
  );

  const ids = useMemo(
    () =>
      new Set(
        annotations
          .map(
            ({ metadata = {} }) =>
              metadata[`${PREFIX}file_external_id`] ||
              metadata[`${PREFIX}file_id`]
          )
          .filter(Boolean)
      ),
    [annotations]
  );

  let count = 0;
  if (ids.size > 0) {
    count = ids.size;
  }
  return { data: count, ...rest };
};

export const useRelatedResourceCount = (
  resource: ResourceItem,
  type: ResourceType
) => {
  const isAsset = resource.type === 'asset';
  const isFile = resource.type === 'file';
  const isAssetTab = type === 'asset';
  const isFileTab = type === 'file';

  const {
    data: linkedResourceCount,
    isFetched: isLinkedResourceFetched,
  } = useAggregate(
    convertResourceType(type),
    { assetSubtreeIds: [{ id: resource.id }] },
    { enabled: isAsset && !!resource.id, staleTime: 60 * 1000 }
  );

  const {
    data: relationships = [],
    isFetched: isRelationshipFetched,
  } = useRelationships(resource.externalId, type);

  const { data: item, isFetched: isResourceFetched } = useCdfItem(
    convertResourceType(resource.type),
    { id: resource.id },
    { enabled: isAssetTab }
  );

  const {
    data: annotationCount,
    isFetched: isAnnotationFetched,
  } = useAnnotationCount(resource.id, type, isFile);

  const {
    data: annotatedWithCount,
    isFetched: isAnnotatedWithFetched,
  } = useFilesAnnotatedWithResourceCount(resource, isFileTab);

  const isFetched =
    isLinkedResourceFetched &&
    isRelationshipFetched &&
    isResourceFetched &&
    isAnnotationFetched &&
    isAnnotatedWithFetched;

  let count = relationships.length;

  let assetIdCount = 0;
  if (isAssetTab && item) {
    if ((item as any).assetId) {
      assetIdCount = 1;
    } else if ((item as any).assetIds) {
      assetIdCount = (item as any).assetIds.length;
    }
  }
  count += assetIdCount;

  if (isAsset && linkedResourceCount) {
    count += linkedResourceCount?.count;
  }

  if (isFile && annotationCount) {
    count += annotationCount;
  }

  if (isFileTab && annotatedWithCount) {
    count += annotatedWithCount;
  }

  return {
    count: formatNumber(count),
    relationshipCount: relationships.length,
    assetIdCount,
    linkedResourceCount: linkedResourceCount?.count,
    annotationCount,
    annotatedWithCount,
    isFetched,
  };
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
