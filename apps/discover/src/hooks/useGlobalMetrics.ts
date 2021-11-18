import { ProjectConfigAzureConfig } from '@cognite/discover-api-types';
import { Properties, useMetrics } from '@cognite/metrics';
import { getAppInsights } from '@cognite/react-azure-telemetry';

import { useProjectConfigByKey } from './useProjectConfig';

export const useGlobalMetrics = (domain?: string) => {
  const appInsights = getAppInsights();
  const metrics = useMetrics(domain);
  const { data: azureConfig } =
    useProjectConfigByKey<ProjectConfigAzureConfig>('azureConfig');

  return {
    track: (eventName: string, eventData?: Properties) => {
      if (azureConfig?.enabled) {
        appInsights?.trackEvent({ name: eventName }, eventData);
      }
      metrics.track(eventName, eventData);
    },
  };
};
