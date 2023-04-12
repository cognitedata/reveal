import debounce from 'lodash/debounce';
import { MetricsMetadata, useMetrics } from '@data-exploration-lib/core';

export const useDebounceTrackUsage = (duration = 500) => {
  const trackUsage = useMetrics();
  return debounce((trackText: string, metadata: MetricsMetadata) => {
    trackUsage(trackText, metadata);
  }, duration);
};
