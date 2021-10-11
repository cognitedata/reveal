import { Properties, useMetrics } from '@cognite/metrics';
import { getAppInsights } from '@cognite/react-azure-telemetry';

import { useTenantConfigByKey } from 'hooks/useTenantConfig';
import { AzureConfig } from 'tenants/types';

export const useGlobalMetrics = (domain?: string) => {
  const appInsights = getAppInsights();
  const metrics = useMetrics(domain);
  const { data: azureConfig } =
    useTenantConfigByKey<AzureConfig>('azureConfig');

  return {
    track: (eventName: string, eventData?: Properties) => {
      if (azureConfig?.enabled) {
        appInsights?.trackEvent({ name: eventName });
      }
      metrics.track(eventName, eventData);
    },
  };
};
