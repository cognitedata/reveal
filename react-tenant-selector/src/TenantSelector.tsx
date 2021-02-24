import React, { useState, useCallback, useEffect } from 'react';
import { CogniteClient } from '@cognite/sdk';
import { configureI18n } from '@cognite/react-i18n';
import { CogniteAuth, AuthenticatedUser, getFlow } from '@cognite/auth-utils';
import { QueryClientProvider, QueryClient } from 'react-query';

// note: only using relative paths until we can setup storybook baseUrl properly:
import { Loader } from '@cognite/cogs.js';
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
  const [setup, setSetup] = useState(false);

  const [authState, setAuthState] = useState<AuthenticatedUser | undefined>();

  const possibleTenant = window.location.pathname.replace(
    /^\/([^/]*).*$/,
    '$1'
  );

  useEffect(() => {
    configureI18n({
      useSuspense: true,
      // required here so we can override translations from
      // localhost or the hosted version
      locize: {
        projectId:
          locizeProjectId || process.env.REACT_APP_LOCIZE_PROJECT_ID || '',
        apiKey: process.env.REACT_APP_LOCIZE_API_KEY || '',
      },
      disabled: disableTranslations,
    }).then(() => setSetup(true));
  }, []);

  const cache = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60000,
        retry: false,
      },
    },
  });

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

  const enabledLoginModes: EnabledModes = {
    cognite: true,
    // if we want to enable other modes in testing
    // we would use a setting here like this:
    // adfs: true,
  };

  const { flow, options } = getFlow(initialTenant || '', cdfCluster);

  let aad;
  if (aadApplicationId) {
    enabledLoginModes.aad = true;

    aad = {
      appId: aadApplicationId,
      directoryTenantId: options?.directory || directoryTenantId,
    };
  }

  const authClient = new CogniteAuth(sdkClient, {
    cluster: cdfCluster,
    flow,
    aad,
  });

  useEffect(() => {
    const unsubscribe = authClient.onAuthChanged(
      applicationId,
      (user: AuthenticatedUser) => {
        if (user) {
          setAuthState(user);
        }
      }
    );

    return () => {
      unsubscribe();
    };
  }, []);

  if (!setup) {
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
