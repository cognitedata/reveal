import useAssetAggregateQuery from './useAssetAggregateQuery';
import useTimeSeriesAggregateQuery from './useTimeSeriesAggregateQuery';
import useEventAggregateQuery from './useEventAggregateQuery';
import useFileAggregateQuery from './useFileAggregateQuery';

const useAssetChildrenAggregates = (assetId: number) => {
  const { data: assetCount, isLoading: isAssetsLoading } =
    useAssetAggregateQuery({
      filter: { parentIds: [assetId] },
    });
  const { data: timeSeriesCount, isLoading: isTimeSeriesLoading } =
    useTimeSeriesAggregateQuery({
      filter: { assetIds: [assetId] },
    });
  const { data: eventCount, isLoading: isEventsLoading } =
    useEventAggregateQuery({
      filter: { assetIds: [assetId] },
    });
  const { data: fileCount, isLoading: isFilesLoading } = useFileAggregateQuery({
    filter: { assetIds: [assetId] },
  });

  const isLoading =
    isAssetsLoading || isTimeSeriesLoading || isEventsLoading || isFilesLoading;
  return {
    data: {
      assets: assetCount,
      timeseries: timeSeriesCount,
      events: eventCount,
      files: fileCount,
    },
    isLoading,
  };
};

export default useAssetChildrenAggregates;
