import * as React from 'react';
import { Router } from 'react-router-dom';
import { Store } from 'redux';

import { withI18nSuspense } from '@cognite/react-i18n';
import { ErrorBoundary } from '@cognite/react-errors';
import { TenantSelector, SidecarConfig } from '@cognite/react-tenant-selector';
import { IntercomBootSettings } from '@cognite/intercom-helper';
import { Loader } from '@cognite/cogs.js';

import { IntercomContainer } from 'components/Intercom';
import {
  AuthContainer,
  AuthContainerForApiKeyMode,
  ConditionalSentry,
  ConditionalLoopDetector,
  TranslationWrapper,
} from './components';
import { configureCogniteSDKClient, createBrowserHistory } from './internal';
import { storage, getTenantInfo } from './utils';
import { ConditionalReduxProvider } from './providers';

const { REACT_APP_API_KEY: apiKey, REACT_APP_API_KEY_PROJECT: project } =
  process.env;

interface ContainerSidecarConfig extends SidecarConfig {
  disableTranslations?: boolean;
  disableLoopDetector?: boolean;
  disableSentry?: boolean;
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

  const { applicationId, cdfApiBaseUrl, disableLoopDetector, disableSentry } =
    sidecar;

  storage.init({ tenant: possibleTenant, appName: applicationId });

  const [history] = React.useState(() => createBrowserHistory(possibleTenant));

  const client = configureCogniteSDKClient(applicationId, {
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

  // this will only ever run locally
  // when deployed it will use the hosted 'Tenant Selector' application
  // which is served by FAS when browsing to '/'
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

  const authError = () => {
    document.location.href = '/';
  };

  return (
    <ConditionalLoopDetector disabled={disableLoopDetector}>
      <ConditionalSentry disabled={disableSentry}>
        <ChosenAuthContainer
          sidecar={sidecar}
          sdkClient={client}
          authError={authError}
          tenant={initialTenant}
        >
          <IntercomContainer
            sidecar={sidecar}
            intercomSettings={intercomSettings}
          >
            <ConditionalReduxProvider store={store}>
              <ErrorBoundary instanceId="container-root">
                <Router history={history}>{children}</Router>
              </ErrorBoundary>
            </ConditionalReduxProvider>
          </IntercomContainer>
        </ChosenAuthContainer>
      </ConditionalSentry>
    </ConditionalLoopDetector>
  );
};

export const Container = (props: Props) => {
  const [_, initialTenant] = getTenantInfo(window.location);
  const projectIsSelected = project || initialTenant;

  const sidecar = {
    ...props.sidecar,
  };

  // do not wrap the container with translations if we are actually going to be on the TSA
  // because TSA has it's own translation system, so we don't want to mix with our apps.
  if (!projectIsSelected) {
    // but we still need to have this wrapper, because there is t() calls in the component
    // so we need to set this flag to load it all in the mocked mode
    sidecar.disableTranslations = true;
  }

  const WrappedConatiner = withI18nSuspense<Props>(RawContainer);
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
