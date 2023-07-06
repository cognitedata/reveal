import { CountsResourceType } from '../types';

import { useLinkedAssetsCount } from './useLinkedAssetsCount';
import { useLinkedEventsCount } from './useLinkedEventsCount';
import { useLinkedFilesCount } from './useLinkedFilesCount';
import { useLinkedSequencesCount } from './useLinkedSequencesCount';
import { useLinkedTimeseriesCount } from './useLinkedTimeseriesCount';

export const useLinkedResourcesCounts = (resourceId?: number) => {
  const assets = useLinkedAssetsCount(resourceId);
  const events = useLinkedEventsCount(resourceId);
  const timeseries = useLinkedTimeseriesCount(resourceId);
  const sequences = useLinkedSequencesCount(resourceId);
  const files = useLinkedFilesCount(resourceId);

  const data: Record<CountsResourceType, number> = {
    asset: assets.data,
    event: events.data,
    timeSeries: timeseries.data,
    sequence: sequences.data,
    file: files.data,
  };

  const isLoading =
    assets.isLoading ||
    events.isLoading ||
    timeseries.isLoading ||
    sequences.isLoading ||
    files.isLoading;

  return { data, isLoading };
};
