import { getTenant, getEnvironment } from '@vision/utils/tenancy';

import { trackEvent } from '@cognite/cdf-route-tracker';

export const pushMetric = (metric: string, options?: Record<string, any>) => {
  const tenant = getTenant();
  const environment = getEnvironment();
  trackEvent(metric, { tenant, environment, ...options });
};
