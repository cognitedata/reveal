import {
  InternalAssetFilters,
  InternalDocumentFilter,
  InternalEventsFilters,
  InternalSequenceFilters,
} from '@data-exploration-lib/core';

type FilterType =
  | InternalAssetFilters
  | InternalEventsFilters
  | InternalDocumentFilter
  | InternalSequenceFilters;

//TODO: remove this when advancedFilter supports assetSubTreeIds
export const getAssetSubtreeIdFilter = (filter?: FilterType): FilterType => {
  if (filter && filter?.assetSubtreeIds) {
    return { assetSubtreeIds: filter?.assetSubtreeIds };
  }

  return {};
};
