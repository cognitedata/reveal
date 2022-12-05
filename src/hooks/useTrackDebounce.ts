import debounce from 'lodash/debounce';
import { MetricsMetadata, useMetrics } from './useMetrics';

export const useDebounceTrackUsage = (duration: number = 500) => {
  const trackUsage = useMetrics();
  return debounce((trackText: string, metadata: MetricsMetadata) => {
    trackUsage(trackText, metadata);
  }, duration);
};
