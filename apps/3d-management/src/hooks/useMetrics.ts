import { useMemo } from 'react';

import { trackEvent } from '@cognite/cdf-route-tracker';

export function useMetrics(namePrefix) {
  const metrics = useMemo(() => {
    return {
      track<T extends object = {}>(eventTitle: string, payload?: T) {
        return trackEvent(`${namePrefix}.${eventTitle}`, payload);
      },
    };
  }, [namePrefix]);

  return metrics;
}
