import * as React from 'react';

import { AzureTelemetryProvider } from '@cognite/react-azure-telemetry';

import { useProjectConfigByKey } from 'hooks/useProjectConfig';
import { AzureConfig } from 'tenants/types';

export const ProvideAzureTelemetry: React.FC = ({ children }) => {
  const { data: azureConfig } =
    useProjectConfigByKey<AzureConfig>('azureConfig');
  if (!azureConfig) {
    return <>{children}</>;
  }

  return (
    <AzureTelemetryProvider
      instrumentationKey={azureConfig?.instrumentationKey}
      options={azureConfig.options}
    >
      {children}
    </AzureTelemetryProvider>
  );
};
