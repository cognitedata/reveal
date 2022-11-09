import * as React from 'react';
import { Router } from 'react-router-dom';
import merge from 'lodash/merge';
import { Store } from 'redux';
import { IntercomBootSettings } from '@cognite/intercom-helper';
import { ErrorBoundary } from '@cognite/react-errors';
import { withI18nSuspense } from '@cognite/react-i18n';
import { SentryProps } from '@cognite/react-sentry';
import '@cognite/cogs.js/dist/cogs.css';

import {
  ConditionalLoopDetector,
  ConditionalQueryClientProvider,
  ConditionalSentry,
  TranslationWrapper,
  TenantSelectorWrapper,
  AuthContainer,
  IntercomContainer,
} from './components';
import { createBrowserHistory } from './internal';
import { ConditionalReduxProvider } from './providers';
import { storage, getProjectInfo } from './utils';
import { ProvideMetrics } from './providers/ProvideMetrics';
import { ContainerSidecarConfig } from './types';

const { REACT_APP_API_KEY_PROJECT: project } = process.env;

type Props = React.PropsWithChildren<{
  store?: Store;
  intercomSettings?: IntercomBootSettings;
  sentrySettings?: SentryProps;
  sidecar: ContainerSidecarConfig;
}>;

const RawContainer: React.FC<Props> = ({
  children,
  store,
  sidecar,
  intercomSettings,
  sentrySettings,
}) => {
  const {
    applicationId,
    disableLoopDetector,
    disableSentry,
    disableIntercom,
    disableReactQuery,
    reactQueryDevtools,
  } = sidecar;

  const [sanitizedProject] = getProjectInfo(window.location);
  const projectOrApiKeyTenant = project || sanitizedProject;

  const [history] = React.useState(() =>
    createBrowserHistory(projectOrApiKeyTenant)
  );

  React.useEffect(() => {
    storage.init({ tenant: projectOrApiKeyTenant, appName: applicationId });
  }, [projectOrApiKeyTenant, applicationId]);

  const refreshPage = () => {
    window.location.assign('/');
  };

  if (!projectOrApiKeyTenant) {
    return <TenantSelectorWrapper sidecar={sidecar} />;
  }

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
          <AuthContainer
            sidecar={sidecar}
            authError={refreshPage}
            project={projectOrApiKeyTenant}
          >
            <IntercomContainer
              intercomSettings={merge(
                {},
                intercomSettings,
                sidecar.intercomSettings
              )}
              project={projectOrApiKeyTenant}
              sidecar={sidecar}
              disabled={disableIntercom}
            >
              <>
                <ProvideMetrics sidecar={sidecar} />
                <ConditionalReduxProvider store={store}>
                  {/* <ErrorBoundary instanceId="container-root"> */}
                  <ErrorBoundary>
                    <Router history={history}>{children}</Router>
                  </ErrorBoundary>
                </ConditionalReduxProvider>
              </>
            </IntercomContainer>
          </AuthContainer>
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

  // Wrappers here are for both TSA and the authed flow
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
