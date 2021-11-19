import * as React from 'react';

import { getTenantInfo, AuthContext } from '@cognite/react-container';
import { Cluster } from '@cognite/sdk-wells-v2';

import { setClient, setEmail, setReAuth } from '_helpers/getCogniteSDKClient';
import { SIDECAR } from 'constants/app';
import { useTenantConfig } from 'hooks/useTenantConfig';
import { authenticateDocumentSDK } from 'modules/documentSearch/sdk';
import { authenticateGeospatialSDK } from 'modules/map/sdk';
import { authenticateSeismicSDK } from 'modules/seismicSearch/service';
import { authenticateWellSDK } from 'modules/wellSearch/sdk';

export const ProvideAuthSetup: React.FC<{
  authState: AuthContext;
}> = ({ authState, children }) => {
  const [doneAuth, setDoneAuth] = React.useState(false);
  const [tenant] = getTenantInfo();

  const { data: tenantConfig } = useTenantConfig();

  const isAzure = tenantConfig?.azureConfig?.enabled;

  const doLoginActions = (token: string) => {
    if (authState.client) {
      setClient(authState.client);
    }

    authenticateGeospatialSDK(tenant, token);

    const email = authState.authState?.email;
    setEmail(email);

    if (tenant && !tenantConfig?.wells?.disabled) {
      authenticateWellSDK(
        SIDECAR.applicationId,
        SIDECAR.cdfApiBaseUrl,
        tenant,
        SIDECAR.cdfCluster as Cluster,
        token
      );
    }
    if (!tenantConfig?.seismic?.disabled) {
      authenticateSeismicSDK(token);
    }

    if (tenant && !tenantConfig?.documents?.disabled) {
      authenticateDocumentSDK(
        SIDECAR.applicationId,
        SIDECAR.cdfApiBaseUrl,
        tenant,
        token
      );
    }

    setDoneAuth(true);
  };

  React.useEffect(() => {
    if (tenantConfig && authState.client) {
      setReAuth(authState.reauthenticate);

      const tokenToUse = authState.authState?.token;

      if (!tokenToUse) {
        return;
      }

      if (isAzure) {
        doLoginActions(tokenToUse);
      } else {
        authState.client.login.status().then((status) => {
          if (status?.project === tenant && authState.client) {
            doLoginActions(tokenToUse);
          }
        });
      }
    }
  }, [authState.authState?.authenticated, tenantConfig, tenant]);

  return doneAuth ? <>{children}</> : null;
};
