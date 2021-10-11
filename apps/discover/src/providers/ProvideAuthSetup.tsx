import * as React from 'react';

import { getAppInsights } from '@cognite/react-azure-telemetry';
import { getTenantInfo, AuthContext } from '@cognite/react-container';
import { Cluster } from '@cognite/sdk-wells';

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

  React.useEffect(() => {
    if (tenantConfig && authState.client) {
      setReAuth(authState.reauthenticate);

      const tokenToUse = authState.authState?.token;

      if (!tokenToUse) {
        return;
      }

      if (isAzure) {
        if (authState.client) {
          setClient(authState.client);
        }

        authenticateGeospatialSDK(tenant, tokenToUse);

        const email = authState.authState?.email;
        setEmail(email);
        const insights = getAppInsights();
        if (insights && email) {
          insights.setAuthenticatedUserContext(email);
          insights.context.user.id = email;
        }

        if (tenant && !tenantConfig?.wells?.disabled) {
          authenticateWellSDK(
            tenant,
            SIDECAR.cdfCluster as Cluster,
            tokenToUse
          );
        }
        if (!tenantConfig?.seismic?.disabled) {
          authenticateSeismicSDK(tokenToUse);
        }

        if (tenant && !tenantConfig?.documents?.disabled) {
          authenticateDocumentSDK(
            SIDECAR.applicationId,
            SIDECAR.cdfApiBaseUrl,
            tenant,
            tokenToUse
          );
        }

        setDoneAuth(true);
      } else {
        authState.client.login.status().then((status) => {
          if (status?.project === tenant && authState.client) {
            setClient(authState.client);
            const email = authState.authState?.email;
            setEmail(email);
            const insights = getAppInsights();
            if (insights && email) {
              insights.setAuthenticatedUserContext(email);
              insights.context.user.id = email;
            }

            authenticateGeospatialSDK(tenant, tokenToUse);
            if (tenant && !tenantConfig?.wells?.disabled) {
              authenticateWellSDK(
                tenant,
                SIDECAR.cdfCluster as Cluster,
                authState.authState?.token
              );
            }
            if (!tenantConfig?.seismic?.disabled) {
              authenticateSeismicSDK(authState.authState?.token);
            }

            if (tenant && !tenantConfig?.documents?.disabled) {
              authenticateDocumentSDK(
                SIDECAR.applicationId,
                SIDECAR.cdfApiBaseUrl,
                tenant,
                authState.authState?.token
              );
            }

            setDoneAuth(true);
          }
        });
      }
    }
  }, [authState, tenantConfig, tenant]);

  return doneAuth ? <>{children}</> : null;
};
