import React, { useState, useCallback, useEffect } from 'react';
import { CogniteClient } from '@cognite/sdk-v5';
import { CogniteAuth, AuthenticatedUser, getFlow } from '@cognite/auth-utils';
import { Loader } from '@cognite/cogs.js';
import { QueryClientProvider, QueryClient } from 'react-query';
import { SidecarConfig } from '@cognite/sidecar';

// note: only using relative paths until we can setup storybook baseUrl properly:
import CardContainer, { EnabledModes } from './components/CardContainer';
import { TenantSelectorBackground } from './components';
import useTenantSelector from './hooks/useTenantSelector';
import useClusterSelector from './hooks/useClusterSelector';
import GlobalStyles from './global-styles';
import background from './assets/background.jpg';

export const TenantSelector: React.FC<{
  sidecar: SidecarConfig;
}> = ({ sidecar }) => {
  const {
    aadApplicationId,
    applicationId,
    applicationName,
    appsApiBaseUrl,
    backgroundImage,
    cdfCluster,
    directoryTenantId,
    disableLegacyLogin,
    disableAzureLogin,
    helpLink,
    fakeIdp,
  } = sidecar;

  const [authenticating, setAuthenticating] = useState(false);
  const [authState, setAuthState] = useState<AuthenticatedUser | undefined>();
  const [authClient, setAuthClient] = useState<CogniteAuth | undefined>();

  const possibleTenant = window.location.pathname.replace(
    /^\/([^/]*).*$/,
    '$1'
  );

  const enabledLoginModes: EnabledModes = {
    cognite: !disableLegacyLogin,
    aad: !!aadApplicationId && !disableAzureLogin,
    fakeIdp,
    // if we want to enable other modes in testing
    // we would use a setting here like this:
    // adfs: true,
  };

  const {
    onTenantSelected,
    checkTenantValidity,
    validatingTenant,
    redirecting,
    initialTenant,
  } = useTenantSelector(applicationId, appsApiBaseUrl);

  const {
    onClusterSelected,
    checkClusterValidity,
    redirectingToCluster,
    validatingCluster,
    initialCluster,
  } = useClusterSelector(applicationId);

  const isLoading =
    redirecting ||
    authenticating ||
    validatingTenant ||
    validatingCluster ||
    redirectingToCluster ||
    initialTenant === possibleTenant;

  const { flow, options } = getFlow(initialTenant || '', cdfCluster);

  const doSetup = async () => {
    const sdkClient = new CogniteClient({
      appId: applicationId,
    });

    const cogniteAuth = new CogniteAuth(sdkClient, {
      aad: aadApplicationId
        ? {
            appId: aadApplicationId,
            directoryTenantId: options?.directory || directoryTenantId,
          }
        : undefined,
      appName: applicationId,
      cluster: cdfCluster,
      flow,
    });

    const unsubscribe = cogniteAuth.onAuthChanged(
      applicationId,
      (user: AuthenticatedUser) => {
        if (user) {
          setAuthState(user);
        }
      }
    );

    setAuthClient(cogniteAuth);
    cogniteAuth.login(); // try and login if we can
    return unsubscribe;
  };

  useEffect(() => {
    const callbacks = doSetup();

    return () => {
      callbacks.then((action) => {
        action();
      });
    };
  }, [sidecar]);

  const cache = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60000,
        retry: false,
      },
    },
  });

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

  if (!authClient) {
    // console.log('Loading from react-tenant-selector', authClient);
    return <Loader />;
  }

  return (
    <QueryClientProvider client={cache}>
      <GlobalStyles />
      <TenantSelectorBackground backgroundImage={backgroundImage || background}>
        <CardContainer
          applicationId={applicationId}
          applicationName={applicationName}
          authClient={authClient}
          authState={authState}
          directory={options?.directory}
          enabledLoginModes={enabledLoginModes}
          handleClusterSubmit={onClusterSelected}
          handleSubmit={onTenantSelected}
          helpLink={helpLink || ''}
          initialCluster={initialCluster || ''}
          initialTenant={initialTenant || ''}
          loading={isLoading}
          validateCluster={performClusterValidation}
          validateTenant={performValidation}
        />
      </TenantSelectorBackground>
    </QueryClientProvider>
  );
};
