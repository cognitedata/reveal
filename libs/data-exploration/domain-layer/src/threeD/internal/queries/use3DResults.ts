import { useCallback, useMemo } from 'react';
import {
  FileTypeVisibility,
  InternalThreedFilters,
} from '@data-exploration-lib/core';
import { DEFAULT_SEARCH_RESULTS_PAGE_SIZE } from '../../../constants';
import { useInfinite3DModelsQuery } from './useInfinite3DModelsQuery';
import { Model3DWithType, ThreeDModelsResponse } from '../types';
import { useInfinite360Images } from './useInfinite360Images';
import { Model3D } from '@cognite/sdk';

export const use3DResults = (
  fileTypeVisibility: FileTypeVisibility,
  query?: string | undefined,
  filter?: InternalThreedFilters,
  limit: number = DEFAULT_SEARCH_RESULTS_PAGE_SIZE
) => {
  const {
    data: threeDModelData = { pages: [] as ThreeDModelsResponse[] },
    fetchNextPage: fetchMore3DModelData,
    hasNextPage: canFetchMore3DModelData,
    isFetchingNextPage: isFetchingMore3DModelData,
  } = useInfinite3DModelsQuery(limit, { enabled: true }, filter);

  const {
    images360Data,
    hasNextPage: canFetchMoreImage360Data,
    fetchNextPage: fetchMoreImage360Data,
    isFetchingNextPage: isFetchingMoreImage360Data,
  } = useInfinite360Images();

  const memoizedFilteredModels = useMemo(() => {
    const models = threeDModelData.pages.reduce(
      (accl, t) => accl.concat(t.items),
      [] as Model3D[]
    );

    const filteredModels = [
      ...(fileTypeVisibility.Images360
        ? images360Data.map<Model3DWithType>((img360Data) => {
            return {
              type: 'img360',
              name: img360Data.siteName,
              siteId: img360Data.siteId,
            };
          })
        : []),
      // ToDo: add Point Clouds
      ...(fileTypeVisibility.CADModels ? models : []),
    ].filter((model) =>
      model.name.toLowerCase().includes(query?.toLowerCase() || '')
    );
    return filteredModels;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [threeDModelData, images360Data, query, fileTypeVisibility]);

  const canFetchMore = useMemo(() => {
    return canFetchMoreImage360Data || canFetchMore3DModelData;
  }, [canFetchMoreImage360Data, canFetchMore3DModelData]);

  const isFetching = useMemo(() => {
    return isFetchingMore3DModelData || isFetchingMoreImage360Data;
  }, [isFetchingMore3DModelData, isFetchingMoreImage360Data]);

  const fetchMore = useCallback(() => {
    if (!isFetchingMoreImage360Data && canFetchMoreImage360Data) {
      fetchMoreImage360Data();
    }
    if (!isFetchingMore3DModelData && canFetchMore3DModelData) {
      fetchMore3DModelData();
    }
  }, [
    fetchMoreImage360Data,
    fetchMore3DModelData,
    isFetchingMore3DModelData,
    isFetchingMoreImage360Data,
    canFetchMoreImage360Data,
    canFetchMore3DModelData,
  ]);

  return {
    canFetchMore,
    fetchMore,
    items: memoizedFilteredModels,
    isFetching,
  };
};
