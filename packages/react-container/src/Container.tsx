import * as React from 'react';
import { Router } from 'react-router-dom';
import { Store } from 'redux';
import { withI18nSuspense } from '@cognite/react-i18n';
import { ErrorBoundary } from '@cognite/react-errors';
import { TenantSelector } from '@cognite/react-tenant-selector';
import { SidecarConfig } from '@cognite/sidecar';
import { IntercomBootSettings } from '@cognite/intercom-helper';
import { Loader } from '@cognite/cogs.js';
import '@cognite/cogs.js/dist/cogs.css';
import merge from 'lodash/merge';

import { IntercomContainer } from './components/Intercom';
import {
  AuthContainer,
  AuthContainerForApiKeyMode,
  ConditionalLoopDetector,
  ConditionalQueryClientProvider,
  ConditionalSentry,
  TranslationWrapper,
} from './components';
import { useCogniteSDKClient, createBrowserHistory } from './internal';
import { storage, getTenantInfo } from './utils';
import { ConditionalReduxProvider } from './providers';

const { REACT_APP_API_KEY: apiKey, REACT_APP_API_KEY_PROJECT: project } =
  process.env;

interface ContainerSidecarConfig extends SidecarConfig {
  disableTranslations?: boolean;
  disableLoopDetector?: boolean;
  disableSentry?: boolean;
  disableIntercom?: boolean;
  disableReactQuery?: boolean;
}

type Props = {
  store?: Store;
  children: React.ReactChild;
  intercomSettings?: IntercomBootSettings;
  sidecar: ContainerSidecarConfig;
};
const RawContainer: React.FC<Props> = ({
  children,
  store,
  sidecar,
  intercomSettings,
}) => {
  const [possibleTenant, initialTenant] = getTenantInfo(window.location);

  const {
    applicationId,
    cdfApiBaseUrl,
    disableLoopDetector,
    disableSentry,
    disableIntercom,
    disableReactQuery,
  } = sidecar;

  storage.init({ tenant: possibleTenant, appName: applicationId });

  const [history] = React.useState(() => createBrowserHistory(possibleTenant));

  const client = useCogniteSDKClient(applicationId, {
    baseUrl: cdfApiBaseUrl,
  });

  const initialTenantOrApiKeyTenant = project || initialTenant;

  React.useEffect(() => {
    if (apiKey) {
      client.loginWithApiKey({
        apiKey,
        project: initialTenantOrApiKeyTenant,
      });
    }
  }, []); // no deps, this only runs once.

  // console.log('Gate info:', {
  //   initialTenantOrApiKeyTenant,
  //   initialTenant,
  //   possibleTenant,
  // });

  if (!possibleTenant) {
    if (!initialTenantOrApiKeyTenant) {
      return <TenantSelector sidecar={sidecar} />;
    }

    history.push(`/${initialTenantOrApiKeyTenant}/`);
    document.location.reload();

    return <Loader />;
  }

  let ChosenAuthContainer = AuthContainer;

  if (apiKey) {
    ChosenAuthContainer = AuthContainerForApiKeyMode;
  }

  const refreshPage = () => {
    document.location.href = '/';
  };

  return (
    <ConditionalLoopDetector disabled={disableLoopDetector}>
      <ConditionalQueryClientProvider disabled={disableReactQuery}>
        <ConditionalSentry disabled={disableSentry} history={history}>
          <ChosenAuthContainer
            sidecar={sidecar}
            sdkClient={client}
            authError={refreshPage}
            tenant={initialTenant}
          >
            <IntercomContainer
              intercomSettings={merge(
                {},
                intercomSettings,
                sidecar.intercomSettings
              )}
              project={initialTenantOrApiKeyTenant}
              sidecar={sidecar}
              disabled={disableIntercom}
            >
              <ConditionalReduxProvider store={store}>
                <ErrorBoundary instanceId="container-root">
                  <Router history={history}>{children}</Router>
                </ErrorBoundary>
              </ConditionalReduxProvider>
            </IntercomContainer>
          </ChosenAuthContainer>
        </ConditionalSentry>
      </ConditionalQueryClientProvider>
    </ConditionalLoopDetector>
  );
};

export const Container = (props: Props) => {
  const sidecar = {
    ...props.sidecar,
  };

  const WrappedConatiner = withI18nSuspense<Props>(RawContainer);

  // wrappers here are for both TSA and the authed flow
  return (
    <TranslationWrapper {...sidecar}>
      <WrappedConatiner {...props} sidecar={sidecar} />
    </TranslationWrapper>
  );
};

export const ContainerWithoutI18N = (props: Props) => (
  <RawContainer
    {...props}
    sidecar={{ ...props.sidecar, disableTranslations: true }}
  />
);
