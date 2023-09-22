import { ChartEventFilters } from '@cognite/charts-lib';
import { Asset, InternalId, DataSet } from '@cognite/sdk';
import { useCdfItems } from '@cognite/sdk-react-query-hooks';

import { InternalEventsFilters } from '@data-exploration-lib/core';
import { useEventsFilterOptions } from '@data-exploration-lib/domain-layer';

export const useDecoratedFilters = (
  filters: ChartEventFilters['filters']
): {
  isLoading: boolean;
  isError: boolean;
  adaptedFilters: InternalEventsFilters;
} => {
  const adaptedFilters: InternalEventsFilters = {
    ...filters,
    assetSubtreeIds: filters.assetSubtreeIds?.length
      ? filters.assetSubtreeIds?.map((el) => ({
          value: (el as InternalId).id,
          label: String((el as InternalId).id),
        }))
      : undefined,
    dataSetIds: filters.dataSetIds?.length
      ? filters.dataSetIds?.map((el) => ({
          value: (el as InternalId).id,
          label: String((el as InternalId).id),
        }))
      : undefined,
    metadata:
      filters.metadata && Object.keys(filters.metadata).length
        ? Object.entries(filters.metadata).map(([key, value]) => ({
            key,
            value,
          }))
        : undefined,
    sources: filters.source
      ? [{ label: filters.source, value: filters.source }]
      : undefined,
    assetIds: undefined,
  };
  const {
    data: datasets = [],
    isError: isDatasetError,
    isLoading: isDatasetLoading,
  } = useCdfItems<DataSet>('datasets', filters.dataSetIds || []);
  const {
    data: assets = [],
    isLoading: isListLoading,
    isError: isListError,
  } = useCdfItems<Asset>('assets', filters.assetSubtreeIds || []);
  const {
    options: sourceOptions,
    isLoading: isSourceLoading,
    isError: isSourceError,
  } = useEventsFilterOptions({
    property: 'source',
    filterProperty: 'sources',
  });

  const isLoading = isDatasetLoading || isListLoading || isSourceLoading;
  const isError = isDatasetError || isListError || isSourceError;

  if (isLoading || isError) {
    return {
      isLoading,
      isError,
      adaptedFilters,
    };
  }

  const dataSetIds = datasets?.length
    ? datasets.map((dataset) => ({
        value: dataset.id,
        label: dataset.name || String(dataset.id),
      }))
    : undefined;

  const sources = filters.source
    ? sourceOptions.filter((source) => source.value === filters.source)
    : undefined;

  const assetSubtreeIds = filters.assetSubtreeIds?.length
    ? assets
        .filter((asset) =>
          filters.assetSubtreeIds
            ?.map((el) => (el as InternalId).id)
            .includes(asset.id)
        )
        .map((asset) => ({
          value: asset.id,
          label: asset.name || String(asset.id),
        }))
    : undefined;

  return {
    isLoading,
    isError,
    adaptedFilters: { ...adaptedFilters, dataSetIds, sources, assetSubtreeIds },
  };
};
