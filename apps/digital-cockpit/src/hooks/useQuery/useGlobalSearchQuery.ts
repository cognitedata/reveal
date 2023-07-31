import { Asset, FileInfo, Timeseries } from '@cognite/sdk';
import { SdkResourceType } from 'types/core';

import { useAssetSearchQuery } from './useAssetQuery';
import useFileSearchQuery from './useFileSearchQuery';
import useTimeSeriesSearchQuery from './useTimeSeriesSearchQuery';

type GlobalSearchResult = {
  assets?: Asset[];
  timeseries?: Timeseries[];
  files?: FileInfo[];
};

export const useGlobalSearchQuery = (query: string, type?: SdkResourceType) => {
  const shouldSearchAssets = query && (!type || type === 'assets');
  const shouldSearchTimeSeries = query && (!type || type === 'timeseries');
  const shouldSearchFiles = query && (!type || type === 'files');

  const assetQuery = shouldSearchAssets
    ? { search: { query }, limit: 5 }
    : undefined;
  const timeSeriesQuery = shouldSearchTimeSeries
    ? { search: { query }, limit: 5 }
    : undefined;
  const filesQuery = shouldSearchFiles
    ? { search: { name: query }, limit: 5 }
    : undefined;

  const { data: assets, isLoading: isAssetsLoading } =
    useAssetSearchQuery(assetQuery);
  const { data: timeseries, isLoading: isTimeSeriesLoading } =
    useTimeSeriesSearchQuery(timeSeriesQuery);
  const { data: files, isLoading: isFilesLoading } =
    useFileSearchQuery(filesQuery);

  const isLoading = isAssetsLoading || isTimeSeriesLoading || isFilesLoading;
  const data: GlobalSearchResult = { assets, timeseries, files };

  return { data, isLoading };
};
