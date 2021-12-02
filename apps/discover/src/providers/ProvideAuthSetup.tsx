import * as React from 'react';

import { getTenantInfo, AuthContext } from '@cognite/react-container';
import { Cluster } from '@cognite/sdk-wells-v2';

import { setClient, setEmail, setReAuth } from '_helpers/getCogniteSDKClient';
import { SIDECAR } from 'constants/app';
import { useProjectConfig } from 'hooks/useProjectConfig';
import { authenticateDocumentSDK } from 'modules/documentSearch/sdk';
import { authenticateGeospatialSDK } from 'modules/map/sdk';
import { authenticateSeismicSDK } from 'modules/seismicSearch/service';
import {
  authenticateWellSDK,
  setEnableWellSDKV3,
} from 'modules/wellSearch/sdk';

export const ProvideAuthSetup: React.FC<{
  authState: AuthContext;
}> = ({ authState, children }) => {
  const [doneAuth, setDoneAuth] = React.useState(false);
  const [project] = getTenantInfo();

  const { data: projectConfig } = useProjectConfig();

  const isAzure = projectConfig?.azureConfig?.enabled;

  const doLoginActions = (token: string) => {
    if (authState.client) {
      setClient(authState.client);
    }

    authenticateGeospatialSDK(project, token);

    const email = authState.authState?.email;
    setEmail(email);

    if (project && !projectConfig?.wells?.disabled) {
      // setting wells v3 enabled before authentication
      setEnableWellSDKV3(projectConfig?.general?.enableWellSDKV3);

      authenticateWellSDK(
        SIDECAR.applicationId,
        SIDECAR.cdfApiBaseUrl,
        project,
        SIDECAR.cdfCluster as Cluster,
        token
      );
    }
    if (!projectConfig?.seismic?.disabled) {
      authenticateSeismicSDK(token);
    }

    if (project && !projectConfig?.documents?.disabled) {
      authenticateDocumentSDK(
        SIDECAR.applicationId,
        SIDECAR.cdfApiBaseUrl,
        project,
        token
      );
    }

    setDoneAuth(true);
  };

  React.useEffect(() => {
    if (projectConfig && authState.client) {
      setReAuth(authState.reauthenticate);

      const tokenToUse = authState.authState?.token;

      if (!tokenToUse) {
        return;
      }

      if (isAzure) {
        doLoginActions(tokenToUse);
      } else {
        authState.client.login.status().then((status) => {
          if (status?.project === project && authState.client) {
            doLoginActions(tokenToUse);
          }
        });
      }
    }
  }, [authState.authState?.authenticated, projectConfig, project, isAzure]);

  return doneAuth ? <>{children}</> : null;
};
