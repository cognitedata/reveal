import { trackEvent } from '@cognite/cdf-route-tracker';

export function useMetrics(namePrefix) {
  return {
    track<T extends object = {}>(eventTitle: string, payload?: T) {
      return trackEvent(`${namePrefix}.${eventTitle}`, payload);
    },
  };
}
