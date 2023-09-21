import { useEffect, useContext, useMemo, useState } from 'react';

import flatten from 'lodash/flatten';
import uniqueBy from 'lodash/uniqBy';

import {
  ExternalId,
  Asset,
  CogniteEvent,
  Sequence,
  Timeseries,
  FileInfo,
} from '@cognite/sdk';
import {
  useCdfItems,
  useAggregate,
  useInfiniteList,
  useCdfItem,
  usePermissions,
} from '@cognite/sdk-react-query-hooks';

import { AppContext, TaggedAnnotation } from '@data-exploration-lib/core';
import {
  useAnnotations,
  useDocumentFilteredAggregateCount,
} from '@data-exploration-lib/domain-layer';

import { getBoundingBoxFromAnnotationIfDefined } from '../containers/Files/FilePreview/Annotations';
import {
  getResourceExternalIdFromTaggedAnnotation,
  getResourceIdFromTaggedAnnotation,
  getResourceTypeFromTaggedAnnotation,
  getTaggedAnnotationAnnotation,
  isApprovedTaggedAnnotation,
  isSuggestedTaggedAnnotation,
  isTaggedAnnotationAnnotation,
} from '../containers/Files/FilePreview/migration/utils';
import { convertResourceType, ResourceItem, ResourceType } from '../types';

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

type RelationshipLabelsOutput = {
  [key: string]: string[];
};

type RelationshipWithTarget = {
  [key: string]: {
    sourceExternalId?: string;
    targetExternalId?: string;
  };
};

function getRelation<T extends Resource>(
  relationship: RelationshipWithTarget,
  item: T
) {
  return item.externalId &&
    relationship[item.externalId] &&
    relationship[item.externalId].sourceExternalId === item.externalId
    ? 'Source'
    : 'Target';
}

const extractRelationships = (
  pages: { items: Relationship[] }[] = [],
  type: 'source' | 'target'
) => {
  const relationships = pages.reduce((accl, t) => {
    t.items.forEach((rel) => {
      const { sourceExternalId, targetExternalId } = rel;

      accl[type === 'source' ? targetExternalId : sourceExternalId] = {
        sourceExternalId,
        targetExternalId,
      };
    });
    return accl;
  }, {} as RelationshipWithTarget);
  return relationships;
};

const extractRelationshipLabels = (
  pages: { items: Relationship[] }[] = []
): RelationshipLabelsOutput => {
  const labels = pages.reduce((accl, page) => {
    page.items.forEach(
      ({ labels: rlabels, sourceExternalId, targetExternalId }) => {
        const labelsExtracted = rlabels.map((label) => label.externalId);
        if (!accl[sourceExternalId]) {
          accl[sourceExternalId] = labelsExtracted;
        } else {
          accl[sourceExternalId].push(...labelsExtracted);
        }
        if (!accl[targetExternalId]) {
          accl[targetExternalId] = labelsExtracted;
        } else {
          accl[targetExternalId].push(...labelsExtracted);
        }
      }
    );
    return accl;
  }, {} as RelationshipLabelsOutput);

  return Object.keys(labels).reduce((acc, item) => {
    const value = Array.from(new Set(labels[item]));

    return { ...acc, [item]: value };
  }, {} as RelationshipLabelsOutput);
};

export const useRelationships = (externalId?: string, type?: ResourceType) => {
  const context = useContext(AppContext);
  const { data: hasRelationshipRead, isFetched: permissionFetched } =
    usePermissions(
      context?.flow! as any,
      'relationshipsAcl',
      'READ',
      undefined,
      {
        enabled: !!context?.flow,
      }
    );
  const enabled = !!(permissionFetched && hasRelationshipRead && !!externalId);

  const sourceRelationships = useInfiniteList<Relationship>(
    // @ts-ignore
    'relationships',
    100,
    {
      sourceExternalIds: [externalId],
      targetTypes: type ? [type] : undefined,
    },

    { enabled, staleTime: 60 * 1000 }
  );

  const targetRelationships = useInfiniteList<Relationship>(
    // @ts-ignore
    'relationships',
    100,
    {
      targetExternalIds: [externalId],
      sourceTypes: type ? [type] : undefined,
    },

    { enabled, staleTime: 60 * 1000 }
  );

  const data = (sourceRelationships.data?.pages[0].items || [])
    .map((item) => ({
      externalId: item.targetExternalId,
      type: item.targetType,
    }))
    .concat(
      (targetRelationships.data?.pages[0].items || []).map((item) => ({
        externalId: item.sourceExternalId,
        type: item.sourceType,
      }))
    );
  const hasNextPage =
    sourceRelationships?.data?.pages[0].nextCursor ||
    targetRelationships?.data?.pages[0].nextCursor;
  return {
    data,
    hasMore: Boolean(hasNextPage),
    isFetching:
      sourceRelationships.isFetching || targetRelationships.isFetching,
    isFetched: sourceRelationships.isFetched && targetRelationships.isFetched,
    isLoading: sourceRelationships.isLoading && targetRelationships.isLoading,
    isError: sourceRelationships.isError || targetRelationships.isError,
  };
};

export const useInfiniteRelationshipsList = <T extends Resource>(
  resourceExternalId?: string,
  type?: ResourceType,
  enabled = true,
  limit: number = PAGE_SIZE
) => {
  const fetchEnabled = enabled && !!resourceExternalId;
  const [labelValue, setLabelValue] = useState<
    RelationshipTypeLabels | undefined
  >();

  const [selectOptions, setSelectOptions] = useState(new Set<string>());

  const onChangeLabelValue = (labels?: string[]) => {
    const newRelationshipFilters =
      labels && labels.length > 0
        ? labels.map((externalId) => ({ externalId }))
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
    limit,
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
    limit,
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
  const targetRelationships = extractRelationships(targetData?.pages, 'target');

  const sourceRelationships = extractRelationships(sourceData?.pages, 'source');

  const { data: targetResources = [] } = useCdfItems<T>(
    convertResourceType(type!),
    targetItems,
    true,
    {
      enabled: targetItems.length > 0,
    }
  );

  const rest = sourceParams.hasNextPage ? sourceParams : targetParams;

  const sourceResourcesWithRelationshipLabels = sourceResources.map((item) => {
    const relation = getRelation(sourceRelationships, item);

    return {
      ...item,
      relation,
      relationshipLabels: item?.externalId
        ? sourceRelationshipLabels[item.externalId]
        : [],
    };
  });

  const targetResourcesWithRelationshipLabels = targetResources.map((item) => {
    const relation = getRelation(targetRelationships, item);
    return {
      ...item,
      relation,
      relationshipLabels: item?.externalId
        ? targetRelationshipLabels[item.externalId]
        : [],
    };
  });

  const relationshipLabelsLength = Object.keys({
    ...targetRelationshipLabels,
    ...sourceRelationshipLabels,
  }).length;

  useEffect(() => {
    const options = new Set(
      flatten(
        Object.values({
          ...targetRelationshipLabels,
          ...sourceRelationshipLabels,
        })
      )
    );

    setSelectOptions((prev) => new Set([...prev, ...options]));

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [relationshipLabelsLength]);

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

export const useTaggedAnnotationsByResourceType = (
  fileId: number,
  resourceType?: ResourceType,
  enabled = true
): {
  data: TaggedAnnotation[];
  isFetched: boolean;
  isFetching: boolean;
  isError: boolean;
  isLoading: boolean;
  isInitialLoading: boolean;
} => {
  const { data: _file = {} } = useCdfItem<{ externalId?: string }>(
    'files',
    { id: fileId },
    { enabled }
  );

  const {
    data: annotationsApiAnnotations,
    isFetching,
    isFetched,
    isError,
    isLoading,
    isInitialLoading,
  } = useAnnotations(fileId, { enabled });

  const annotations = useMemo(
    () =>
      uniqueBy(
        [
          ...[
            ...annotationsApiAnnotations
              .map(getTaggedAnnotationAnnotation)
              .filter(
                (taggedAnnotation) =>
                  getResourceTypeFromTaggedAnnotation(taggedAnnotation) ===
                  resourceType
              ),
          ].filter(
            (taggedAnnotation) =>
              isApprovedTaggedAnnotation(taggedAnnotation) ||
              isSuggestedTaggedAnnotation(taggedAnnotation)
          ),
        ],
        (taggedAnnotation) => {
          if (isTaggedAnnotationAnnotation(taggedAnnotation)) {
            return getBoundingBoxFromAnnotationIfDefined(taggedAnnotation);
          }

          return undefined;
        }
      ),
    [annotationsApiAnnotations, resourceType]
  );

  return {
    data: annotations,
    isFetched,
    isFetching,
    isError,
    isLoading,
    isInitialLoading,
  };
};

export const useRelationshipCount = (
  resource: ResourceItem,
  type: ResourceType
) => {
  const {
    data: relationships,
    hasMore,
    isFetched,
    ...rest
  } = useRelationships(resource.externalId, type);

  let count = 0;
  if (isFetched && relationships?.length > 0) {
    count = relationships.length;
  }

  return { data: count, hasMore, isFetched, ...rest };
};

export const useTaggedAnnotationCount = (
  fileId: number,
  resourceType: ResourceType,
  enabled = true
) => {
  const { data: taggedAnnotations, ...rest } =
    useTaggedAnnotationsByResourceType(fileId, resourceType, enabled);

  const ids = useMemo(
    () =>
      new Set(
        taggedAnnotations
          .map((taggedAnnotation) => {
            return (
              getResourceExternalIdFromTaggedAnnotation(taggedAnnotation) ||
              getResourceIdFromTaggedAnnotation(taggedAnnotation)
            );
          })
          .filter(Boolean)
      ),
    [taggedAnnotations]
  );

  let count = 0;
  if (ids.size > 0) {
    count = ids.size;
  }
  return { data: count, ...rest };
};

export const useRelatedResourceCount = (
  resource: ResourceItem,
  tabType: ResourceType,
  isAdvancedFiltersEnabled = false
) => {
  const isAsset = resource.type === 'asset';
  const isFile = resource.type === 'file';
  const isAssetTab = tabType === 'asset';
  const isFileTab = tabType === 'file';

  const {
    data: linkedResourceCount,
    isFetched: isLinkedResourceFetched,
    isLoading: isLinkedResourceLoading,
  } = useAggregate(
    convertResourceType(tabType),
    { assetSubtreeIds: [{ id: resource.id }] },
    {
      enabled: isAsset && !isAdvancedFiltersEnabled && !!resource.id,
      staleTime: 60 * 1000,
    }
  );

  const {
    data: fileCount,
    isFetched: isFileCountFetched,
    isLoading: isFileCountLoading,
  } = useDocumentFilteredAggregateCount(
    {
      filters: { assetSubtreeIds: [{ value: resource.id }] },
    },
    undefined,
    { enabled: isFileTab && isAdvancedFiltersEnabled }
  );

  const {
    data: relationships = [],
    hasMore,
    isFetched: isRelationshipFetched,
    isLoading: isRelationshipLoading,
  } = useRelationships(resource.externalId, tabType);

  type Item = {
    assetId?: string;
    assetIds?: string[];
  };

  const {
    data: item,
    isFetched: isResourceFetched,
    isLoading: isResourceLoading,
  } = useCdfItem<Item>(
    convertResourceType(resource.type),
    { id: resource.id },
    { enabled: isAssetTab }
  );

  const {
    data: annotationCount,
    isFetched: isAnnotationFetched,
    isLoading: isAnnotationLoading,
  } = useTaggedAnnotationCount(resource.id, tabType, isFile);

  const isFetched =
    isLinkedResourceFetched &&
    isRelationshipFetched &&
    isResourceFetched &&
    isAnnotationFetched &&
    isFileCountFetched;

  const isLoading =
    isLinkedResourceLoading &&
    isRelationshipLoading &&
    isResourceLoading &&
    isAnnotationLoading &&
    isFileCountLoading;

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

  if (isFileTab && fileCount && isAdvancedFiltersEnabled) {
    count += fileCount;
  }

  return {
    count: count,
    relationshipCount: relationships.length,
    hasMoreRelationships: hasMore,
    assetIdCount,
    linkedResourceCount: isAssetTab
      ? Math.max((linkedResourceCount?.count ?? 1) - 1, 0)
      : linkedResourceCount?.count,
    annotationCount,
    isFetched,
    isLoading,
  };
};

export const useRelatedResourceCounts = (
  resource: ResourceItem,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  isAdvancedFiltersEnabled = false
): {
  counts: { [key in ResourceType]?: number };
  hasMoreRelationships: { [key in ResourceType]?: boolean };
  isLoading: { [key in ResourceType]?: boolean };
} => {
  const {
    count: asset,
    hasMoreRelationships: assetRelation,
    isLoading: isAssetCountLoading,
  } = useRelatedResourceCount(resource, 'asset');
  const {
    count: event,
    hasMoreRelationships: eventRelation,
    isLoading: isEventCountLoading,
  } = useRelatedResourceCount(resource, 'event');
  const {
    count: file,
    hasMoreRelationships: fileRelation,
    isLoading: isFileCountLoading,
  } = useRelatedResourceCount(resource, 'file');
  const {
    count: sequence,
    hasMoreRelationships: sequenceRelation,
    isLoading: isSequenceCountLoading,
  } = useRelatedResourceCount(resource, 'sequence');
  const {
    count: timeSeries,
    hasMoreRelationships: timeSeriesRelation,
    isLoading: isTimeseriesCountLoading,
  } = useRelatedResourceCount(resource, 'timeSeries');

  return {
    counts: {
      asset,
      event,
      file,
      sequence,
      timeSeries,
    },
    hasMoreRelationships: {
      asset: assetRelation,
      event: eventRelation,
      file: fileRelation,
      sequence: sequenceRelation,
      timeSeries: timeSeriesRelation,
    },
    isLoading: {
      asset: isAssetCountLoading,
      event: isEventCountLoading,
      file: isFileCountLoading,
      sequence: isSequenceCountLoading,
      timeSeries: isTimeseriesCountLoading,
    },
  };
};
