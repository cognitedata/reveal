import { getTenant, getEnvironment } from 'src/utils/tenancy';
import { trackEvent } from '@cognite/cdf-route-tracker';

export const pushMetric = (metric: string) => {
  const tenant = getTenant();
  const environment = getEnvironment();
  console.log(`Metric Debug:  ${metric}`, { tenant, environment });
  trackEvent(metric, { tenant, environment });
};
