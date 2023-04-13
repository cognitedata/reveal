import { useContext } from 'react';
import { AppContext } from '../contexts';
import noop from 'lodash/noop';
import debounce from 'lodash/debounce';

export type MetricsMetadata = {
  [key: string]: any;
};

export const useMetrics = () => {
  const context = useContext(AppContext);
  const trackUsage = context?.trackUsage;

  if (!trackUsage) return noop;

  return trackUsage;
};

// INFO: `useDebounceTrackUsage` is copied from the old components repo.
export const useDebouncedMetrics = (duration = 300) => {
  const trackUsage = useMetrics();
  return debounce((trackText: string, metadata: MetricsMetadata) => {
    trackUsage(trackText, metadata);
  }, duration);
};
