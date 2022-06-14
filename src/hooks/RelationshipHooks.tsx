import {
  useList,
  useCdfItems,
  useAggregate,
  useInfiniteList,
  useCdfItem,
  usePermissions,
} from '@cognite/sdk-react-query-hooks';
import { ResourceType, ResourceItem, convertResourceType } from 'types';
import { formatNumber } from 'utils/numbers';
import { useEffect, useContext, useMemo, useState } from 'react';
import {
  ExternalId,
  Asset,
  CogniteEvent,
  Sequence,
  Timeseries,
  FileInfo,
} from '@cognite/sdk';
import flatten from 'lodash/flatten';
import {
  annotationInteralIdFilter,
  annotationExternalIdFilter,
} from 'utils/filters';
import {
  ANNOTATION_METADATA_PREFIX as PREFIX,
  ANNOTATION_EVENT_TYPE,
  CURRENT_VERSION,
} from '@cognite/annotations';
import uniqueBy from 'lodash/uniqBy';
import { AppContext } from 'context/AppContext';

const PAGE_SIZE = 20;

export type Resource = FileInfo | Asset | CogniteEvent | Sequence | Timeseries;

export type Relationship = {
  targetType: ResourceType;
  targetExternalId: string;
  sourceType: ResourceType;
  sourceExternalId: string;
  labels: {
    externalId: string;
  }[];
};

export type RelationshipTypeLabels = { externalId: string }[];

const extractRelationshipLabels = (
  pages: { items: Relationship[] }[] = []
): string[][] => {
  const labels = pages.reduce(
    (accl, page) =>
      accl.concat(
        page.items.map(({ labels: rlabels }) =>
          rlabels.map(label => label.externalId)
        )
      ),
    [] as string[][]
  );
  return labels;
};

export const useRelationships = (externalId?: string, type?: ResourceType) => {
  const context = useContext(AppContext);
  const { data: hasRelationshipRead, isFetched: permissionFetched } =
    usePermissions(context?.flow!, 'relationshipsAcl', 'READ', undefined, {
      enabled: !!context?.flow,
    });
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
  const [labelValue, setLabelValue] = useState<
    RelationshipTypeLabels | undefined
  >();

  const [selectOptions, setSelectOptions] = useState(new Set<string>());

  const onChangeLabelValue = (labels?: string[]) => {
    const newRelationshipFilters =
      labels && labels.length > 0
        ? labels.map(externalId => ({ externalId }))
        : undefined;
    setLabelValue(newRelationshipFilters);
  };

  const extractExternalIds = (
    pages: { items: Relationship[] }[] = [],
    key: 'target' | 'source'
  ): ExternalId[] => {
    const externalIdKey =
      key === 'source' ? 'targetExternalId' : 'sourceExternalId';

    // Extracting externalIds from pages
    const externalIds = pages.reduce(
      (accl, t) =>
        accl.concat(
          t.items.map(({ [externalIdKey]: externalId }) => ({
            externalId,
          }))
        ),
      [] as ExternalId[]
    );

    // Removing duplicate ids from array
    const filteredExternalIds = externalIds.filter(
      ({ externalId }, index, arr) =>
        arr.findIndex(
          ({ externalId: testExternalId }) => testExternalId === externalId
        ) === index
    );

    return filteredExternalIds;
  };

  const { data: sourceData, ...sourceParams } = useInfiniteList<Relationship>(
    // @ts-ignore
    'relationships',
    PAGE_SIZE,
    {
      sourceExternalIds: [resourceExternalId],
      targetTypes: [type],
      ...(labelValue && {
        labels: {
          containsAny: labelValue,
        },
      }),
    },
    { enabled: fetchEnabled, staleTime: 60 * 1000 }
  );

  const sourceItems = useMemo(
    () => extractExternalIds(sourceData?.pages, 'source'),
    [sourceData]
  );
  const { data: sourceResources = [] } = useCdfItems<T>(
    convertResourceType(type!),
    sourceItems,
    true,
    {
      enabled: sourceItems.length > 0,
    }
  );

  const sourceRelationshipLabels = extractRelationshipLabels(sourceData?.pages);
  const fetchTarget = !!sourceParams && !sourceParams.hasNextPage;

  const { data: targetData, ...targetParams } = useInfiniteList<Relationship>(
    // @ts-ignore
    'relationships',
    PAGE_SIZE,
    {
      targetExternalIds: [resourceExternalId],
      sourceTypes: [type],
      ...(labelValue && {
        labels: {
          containsAny: labelValue,
        },
      }),
    },
    {
      enabled: fetchEnabled && fetchTarget,
      staleTime: 60 * 1000,
    }
  );

  const targetRelationshipLabels = extractRelationshipLabels(targetData?.pages);
  const targetItems = useMemo(
    () => extractExternalIds(targetData?.pages, 'target'),
    [targetData]
  );

  const { data: targetResources = [] } = useCdfItems<T>(
    convertResourceType(type!),
    targetItems,
    true,
    {
      enabled: targetItems.length > 0,
    }
  );

  const rest = sourceParams.hasNextPage ? sourceParams : targetParams;
  const sourceResourcesWithRelationshipLabels = sourceResources.map(
    (item, idx) => ({
      ...item,
      ...(sourceRelationshipLabels && {
        relationshipLabels: sourceRelationshipLabels[idx],
      }),
    })
  );

  const targetResourcesWithRelationshipLabels = targetResources.map(
    (item, idx) => ({
      ...item,
      ...(targetRelationshipLabels && {
        relationshipLabels: targetRelationshipLabels[idx],
      }),
    })
  );

  useEffect(() => {
    const options = new Set(
      flatten([...targetRelationshipLabels, ...sourceRelationshipLabels])
    );

    setSelectOptions(prev => new Set([...prev, ...options]));

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetRelationshipLabels.length, sourceRelationshipLabels.length]);

  return {
    items: [
      ...sourceResourcesWithRelationshipLabels,
      ...targetResourcesWithRelationshipLabels,
    ],
    relationshipLabelOptions: Array.from(selectOptions),
    onChangeLabelValue,
    labelValue,

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
  const {
    data: relationships,
    isFetched,
    ...rest
  } = useRelationships(resource.externalId, type);

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
  tabType: ResourceType
) => {
  const isAsset = resource.type === 'asset';
  const isFile = resource.type === 'file';
  const isAssetTab = tabType === 'asset';
  const isFileTab = tabType === 'file';

  const { data: linkedResourceCount, isFetched: isLinkedResourceFetched } =
    useAggregate(
      convertResourceType(tabType),
      { assetSubtreeIds: [{ id: resource.id }] },
      { enabled: isAsset && !!resource.id, staleTime: 60 * 1000 }
    );

  const { data: relationships = [], isFetched: isRelationshipFetched } =
    useRelationships(resource.externalId, tabType);

  type Item = {
    assetId?: string;
    assetIds?: string[];
  };

  const { data: item, isFetched: isResourceFetched } = useCdfItem<Item>(
    convertResourceType(resource.type),
    { id: resource.id },
    { enabled: isAssetTab }
  );

  const { data: annotationCount, isFetched: isAnnotationFetched } =
    useAnnotationCount(resource.id, tabType, isFile);

  const { data: annotatedWithCount, isFetched: isAnnotatedWithFetched } =
    useFilesAnnotatedWithResourceCount(resource, isFileTab);

  const isFetched =
    isLinkedResourceFetched &&
    isRelationshipFetched &&
    isResourceFetched &&
    isAnnotationFetched &&
    isAnnotatedWithFetched;

  let count = relationships.length;

  let assetIdCount = 0;
  if (isAssetTab && item) {
    if (item.assetId) {
      assetIdCount = 1;
    } else if (item.assetIds) {
      assetIdCount = item.assetIds.length;
    }
  }
  count += assetIdCount;

  if (isAsset && linkedResourceCount?.count) {
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
    linkedResourceCount: isAssetTab
      ? Math.max((linkedResourceCount?.count ?? 1) - 1, 0)
      : linkedResourceCount?.count,
    annotationCount,
    annotatedWithCount,
    isFetched,
  };
};

export const useRelatedResourceCounts = (
  resource: ResourceItem
): { counts: { [key in ResourceType]?: string } } => {
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
