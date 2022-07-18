import * as React from 'react';

import {
  getAppInsights,
  AzureTelemetryProvider,
} from '@cognite/react-azure-telemetry';
import { useAuthContext } from '@cognite/react-container';

import { useProjectConfigByKey } from 'hooks/useProjectConfig';

const AuthenticatedUserContext: React.FC<React.PropsWithChildren<unknown>> = ({
  children,
}) => {
  const { authState } = useAuthContext();

  React.useEffect(() => {
    const email = authState?.email;
    const insights = getAppInsights();
    if (insights && email) {
      insights.setAuthenticatedUserContext(email);
      insights.context.user.id = email;
    }
  }, [authState?.email]);

  return <>{children}</>;
};

export const ProvideAzureTelemetry: React.FC<
  React.PropsWithChildren<unknown>
> = ({ children }) => {
  const { data: azureConfig } = useProjectConfigByKey('azureConfig');

  if (!azureConfig) {
    return <>{children}</>;
  }

  return (
    <AzureTelemetryProvider
      instrumentationKey={azureConfig?.instrumentationKey}
      options={azureConfig.options}
    >
      <AuthenticatedUserContext>{children}</AuthenticatedUserContext>
    </AzureTelemetryProvider>
  );
};
