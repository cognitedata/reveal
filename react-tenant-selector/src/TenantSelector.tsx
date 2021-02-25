import React, { useState, useCallback, useEffect } from 'react';
import { CogniteClient } from '@cognite/sdk';
import { configureI18n } from '@cognite/react-i18n';
import { CogniteAuth, AuthenticatedUser, getFlow } from '@cognite/auth-utils';
import { Loader } from '@cognite/cogs.js';
import { QueryClientProvider, QueryClient } from 'react-query';

// note: only using relative paths until we can setup storybook baseUrl properly:
import CardContainer, { EnabledModes } from './components/CardContainer';
import { TenantSelectorBackground } from './components';
import { SidecarConfig } from './utils';
import useTenantSelector from './hooks/useTenantSelector';
import useClusterSelector from './hooks/useClusterSelector';
import GlobalStyles from './global-styles';
import background from './assets/background.jpg';

import '@cognite/cogs.js/dist/cogs.css';

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
    disableTranslations,
    helpLink,
    locizeProjectId,
  } = sidecar;

  const [authenticating, setAuthenticating] = useState(false);
  const [authState, setAuthState] = useState<AuthenticatedUser | undefined>();
  const [authClient, setAuthClient] = useState<CogniteAuth | undefined>();

  const possibleTenant = window.location.pathname.replace(
    /^\/([^/]*).*$/,
    '$1'
  );

  const enabledLoginModes: EnabledModes = {
    cognite: true,
    aad: !!aadApplicationId,
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
  } = useClusterSelector(applicationId);

  const isLoading =
    redirecting ||
    authenticating ||
    validatingTenant ||
    validatingCluster ||
    redirectingToCluster ||
    initialTenant === possibleTenant;

  const doSetup = async () => {
    const sdkClient = new CogniteClient({
      appId: applicationId,
    });

    await configureI18n({
      useSuspense: true,
      // required here so we can override translations from
      // localhost or the hosted version
      locize: {
        projectId:
          locizeProjectId || process.env.REACT_APP_LOCIZE_PROJECT_ID || '',
        apiKey: process.env.REACT_APP_LOCIZE_API_KEY || '',
      },
      disabled: disableTranslations,
    });

    const { flow, options } = getFlow(initialTenant || '', cdfCluster);

    const cogniteAuth = new CogniteAuth(sdkClient, {
      aad: aadApplicationId
        ? {
            appId: aadApplicationId,
            directoryTenantId: options?.directory || directoryTenantId,
          }
        : undefined,
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
          cdfCluster={cdfCluster}
          enabledLoginModes={enabledLoginModes}
          handleClusterSubmit={onClusterSelected}
          handleSubmit={onTenantSelected}
          helpLink={helpLink || ''}
          initialTenant={initialTenant || ''}
          loading={isLoading}
          validateCluster={performClusterValidation}
          validateTenant={performValidation}
        />
      </TenantSelectorBackground>
    </QueryClientProvider>
  );
};
