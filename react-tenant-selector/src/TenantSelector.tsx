import React, { useState, useCallback, useEffect } from 'react';
import { CogniteAuth, AuthenticatedUser } from '@cognite/auth-utils';
import { CogniteClient } from '@cognite/sdk';

// note: only using relative paths until we can setup storybook baseUrl properly:
import { getClusterFromCdfApiBaseUrl } from './utils/cluster';
import CardContainer, { EnabledModes } from './components/CardContainer';
import { TenantSelectorBackground } from './components';
import { getSidecar } from './utils';
import useTenantSelector from './hooks/useTenantSelector';
import useClusterSelector from './hooks/useClusterSelector';
import GlobalStyles from './global-styles';
import background from './assets/background.jpg';

import '@cognite/cogs.js/dist/cogs.css';

export const TenantSelector: React.FC = () => {
  const {
    applicationId,
    cdfApiBaseUrl,
    backgroundImage,
    helpLink,
    AADClientID,
    AADTenantID,
  } = getSidecar();
  const [authenticating, setAuthenticating] = useState(false);

  const [authState, setAuthState] = useState<AuthenticatedUser | undefined>();

  const possibleTenant = window.location.pathname.replace(
    /^\/([^/]*).*$/,
    '$1'
  );

  const {
    onTenantSelected,
    checkTenantValidity,
    validatingTenant,
    redirecting,
    initialTenant,
  } = useTenantSelector(applicationId);

  const {
    onClusterSelected,
    checkClusterValidity,
    redirectingToCluster,
    validatingCluster,
  } = useClusterSelector(applicationId);

  const isLoading =
    redirecting ||
    authenticating ||
    validatingTenant ||
    validatingCluster ||
    redirectingToCluster ||
    initialTenant === possibleTenant;

  // --TODO: Set a timeout here so that we detect if we're ever
  // in this loading state for too long.

  const performValidation = useCallback(
    (tenant: string) => {
      setAuthenticating(true);
      return checkTenantValidity(tenant).finally(() => {
        setAuthenticating(false);
      });
    },
    [checkTenantValidity]
  );

  const performClusterValidation = useCallback(
    (tenant: string, cluster: string) => {
      setAuthenticating(true);
      return checkClusterValidity(tenant, cluster).finally(() => {
        setAuthenticating(false);
      });
    },
    [checkClusterValidity]
  );

  const sdkClient = new CogniteClient({
    appId: applicationId,
  });

  let msalConfig;

  const enabledLoginModes: EnabledModes = {
    cognite: true,
    // adfs: true,
  };

  if (AADClientID) {
    msalConfig = {
      auth: {
        authority:
          // 'https://login.microsoftonline.com/common',
          // 'https://login.microsoftonline.com/organizations',
          `https://login.microsoftonline.com/${AADTenantID}`,
        clientId: AADClientID,
        redirectUri: `${window.location.origin}`,
      },
    };

    enabledLoginModes.aad = true;
  }

  const authClient = new CogniteAuth(sdkClient, {
    msalConfig,
    cluster: getClusterFromCdfApiBaseUrl(cdfApiBaseUrl),
  });

  useEffect(() => {
    const unsubscribe = authClient.onAuthChanged(
      applicationId,
      (user: AuthenticatedUser) => {
        setAuthState(user);
      }
    );

    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <>
      <GlobalStyles />
      <TenantSelectorBackground backgroundImage={backgroundImage || background}>
        <CardContainer
          authState={authState}
          validateTenant={performValidation}
          validateCluster={performClusterValidation}
          handleSubmit={onTenantSelected}
          handleClusterSubmit={onClusterSelected}
          loading={isLoading}
          initialTenant={initialTenant || ''}
          helpLink={helpLink || ''}
          authClient={authClient}
          enabledLoginModes={enabledLoginModes}
        />
      </TenantSelectorBackground>
    </>
  );
};
