import * as React from 'react';
import { Router } from 'react-router-dom';
import merge from 'lodash/merge';
import { Store } from 'redux';
import { Loader } from '@cognite/cogs.js';
import { IntercomBootSettings } from '@cognite/intercom-helper';
import { ErrorBoundary } from '@cognite/react-errors';
import { withI18nSuspense } from '@cognite/react-i18n';
import { SentryProps } from '@cognite/react-sentry';
import { SidecarConfig } from '@cognite/sidecar';
import '@cognite/cogs.js/dist/cogs.css';

import {
  AuthContainer,
  AuthContainerForApiKeyMode,
  ConditionalLoopDetector,
  ConditionalQueryClientProvider,
  ConditionalSentry,
  TranslationWrapper,
  TenantSelectorWrapper,
} from './components';
import { IntercomContainer } from './components/Intercom';
import { useCogniteSDKClient, createBrowserHistory } from './internal';
import { ConditionalReduxProvider } from './providers';
import { storage, getTenantInfo } from './utils';

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
  sentrySettings?: SentryProps;
  sidecar: ContainerSidecarConfig;
};
const RawContainer: React.FC<Props> = ({
  children,
  store,
  sidecar,
  intercomSettings,
  sentrySettings,
}) => {
  const [possibleTenant, initialTenant] = getTenantInfo(window.location);

  const {
    applicationId,
    cdfApiBaseUrl,
    disableLoopDetector,
    disableSentry,
    disableIntercom,
    disableReactQuery,
    reactQueryDevtools,
  } = sidecar;

  const [history] = React.useState(() => createBrowserHistory(possibleTenant));

  const client = useCogniteSDKClient(applicationId, {
    baseUrl: cdfApiBaseUrl,
  });

  const initialTenantOrApiKeyTenant = project || initialTenant;

  React.useEffect(() => {
    storage.init({ tenant: possibleTenant, appName: applicationId });
  }, [possibleTenant, applicationId]);

  React.useEffect(() => {
    if (apiKey) {
      client.loginWithApiKey({
        apiKey,
        project: initialTenantOrApiKeyTenant,
      });
    }
  }, []); // no deps, this only runs once.

  if (!possibleTenant) {
    if (!initialTenantOrApiKeyTenant) {
      return <TenantSelectorWrapper sidecar={sidecar} />;
    }
    history.push(`/${initialTenantOrApiKeyTenant}/`);
    document.location.reload();
    return <Loader />;
  }
  const ChosenAuthContainer = apiKey
    ? AuthContainerForApiKeyMode
    : AuthContainer;

  const refreshPage = () => {
    document.location.href = '/';
  };

  return (
    <ConditionalLoopDetector disabled={disableLoopDetector}>
      <ConditionalQueryClientProvider
        disabled={disableReactQuery}
        reactQueryDevtools={reactQueryDevtools}
      >
        <ConditionalSentry
          disabled={disableSentry}
          history={history}
          {...sentrySettings}
        >
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
