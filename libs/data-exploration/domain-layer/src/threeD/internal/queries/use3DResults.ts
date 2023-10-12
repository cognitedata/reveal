import {
  DEFAULT_SEARCH_RESULTS_PAGE_SIZE_3D,
  FileTypeVisibility,
  InternalThreeDFilters,
} from '@data-exploration-lib/core';

import {
  DEFAULT_GLOBAL_TABLE_MAX_RESULT_LIMIT,
  MAX_SEQUENTIAL_REQUEST_LIMIT_3D,
} from '../../../constants';
import { TableSortBy } from '../../../types';

import { useApiBuffer } from './useApiBuffer';
import { useImage360Query } from './useImage360Query';
import { useInfinite3DModelsQuery } from './useInfinite3DModelsQuery';

export const use3DResults = (
  fileTypeVisibility: FileTypeVisibility,
  query?: string | undefined,
  filter?: InternalThreeDFilters,
  sort?: TableSortBy[],
  limit: number = DEFAULT_SEARCH_RESULTS_PAGE_SIZE_3D
) => {
  const image360Api = useImage360Query(query, filter);

  const threeDModelApi = useInfinite3DModelsQuery(
    DEFAULT_GLOBAL_TABLE_MAX_RESULT_LIMIT,
    { enabled: fileTypeVisibility.Models3D },
    query
  );

  const { data, loadMore, isFetching, canFetchMore, fetchedCount } =
    useApiBuffer(
      [
        { ...image360Api, enabled: fileTypeVisibility.Images360 },
        { ...threeDModelApi, enabled: fileTypeVisibility.Models3D },
      ],
      limit,
      sort,
      query,
      {
        autoLoad: true,
        requestLimit: MAX_SEQUENTIAL_REQUEST_LIMIT_3D,
      }
    );

  return {
    count: fetchedCount,
    canFetchMore,
    fetchMore: loadMore,
    models: data,
    isFetching,
  };
};
