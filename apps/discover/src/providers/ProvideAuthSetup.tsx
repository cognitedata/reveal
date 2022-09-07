import { authenticateWellSDK } from 'domain/wells/utils/authenticate';

import * as React from 'react';

import { setClient, setEmail, setReAuth } from 'utils/getCogniteSDKClient';

import { getProjectInfo, AuthContext } from '@cognite/react-container';

import { SIDECAR } from 'constants/app';
import { useProjectConfig } from 'hooks/useProjectConfig';
import { authenticateSeismicSDK } from 'modules/seismicSearch/service';

export const ProvideAuthSetup: React.FC<
  React.PropsWithChildren<{
    authState: AuthContext;
  }>
> = ({ authState, children }) => {
  const [doneAuth, setDoneAuth] = React.useState(false);
  const [project] = getProjectInfo();

  const { data: projectConfig } = useProjectConfig();

  const isAzure = projectConfig?.azureConfig?.enabled;

  const doLoginActions = (token: string) => {
    if (authState.client) {
      setClient(authState.client);
    }

    const email = authState.authState?.email;
    setEmail(email);

    if (project && !projectConfig?.wells?.disabled) {
      authenticateWellSDK(
        SIDECAR.applicationId,
        SIDECAR.cdfApiBaseUrl,
        project,
        token
      );
    }
    if (!projectConfig?.seismic?.disabled) {
      authenticateSeismicSDK(token);
    }

    setDoneAuth(true);
  };

  React.useEffect(() => {
    setReAuth(authState.reauthenticate);

    if (projectConfig && authState.client) {
      const tokenToUse = authState.authState?.token;

      if (!tokenToUse) {
        return;
      }

      doLoginActions(tokenToUse);
    }
  }, [
    authState.authState?.authenticated,
    projectConfig,
    project,
    isAzure,
    authState.authState?.token,
  ]);

  return doneAuth ? <>{children}</> : null;
};
