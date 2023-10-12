import { trackEvent } from '@cognite/cdf-route-tracker';

import { getTenant, getEnvironment } from './tenancy';

export const pushMetric = (metric: string, options?: Record<string, any>) => {
  const tenant = getTenant();
  const environment = getEnvironment();
  trackEvent(metric, { tenant, environment, ...options });
};
