import { getTenant, getEnvironment } from 'src/utils/tenancy';
import { trackEvent } from '@cognite/cdf-route-tracker';

export const pushMetric = (metric: string) => {
  const tenant = getTenant();
  const environment = getEnvironment();
  trackEvent(metric, { tenant, environment });
};
