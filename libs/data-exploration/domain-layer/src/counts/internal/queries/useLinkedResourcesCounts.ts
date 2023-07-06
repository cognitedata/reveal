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
    asset: assets.data || 0,
    event: events.data || 0,
    timeSeries: timeseries.data || 0,
    sequence: sequences.data || 0,
    file: files.data || 0,
  };

  const isLoading =
    assets.isLoading ||
    events.isLoading ||
    timeseries.isLoading ||
    sequences.isLoading ||
    files.isLoading;

  return { data, isLoading };
};
