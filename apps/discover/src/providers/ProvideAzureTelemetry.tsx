import * as React from 'react';

import { AzureTelemetryProvider } from '@cognite/react-azure-telemetry';

import { useTenantConfigByKey } from 'hooks/useTenantConfig';
import { AzureConfig } from 'tenants/types';

export const ProvideAzureTelemetry: React.FC = ({ children }) => {
  const { data: azureConfig } =
    useTenantConfigByKey<AzureConfig>('azureConfig');
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
