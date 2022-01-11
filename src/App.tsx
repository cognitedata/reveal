import { Router } from 'react-router-dom';
import { SDKProvider } from '@cognite/sdk-provider';
import { QueryClientProvider, QueryClient } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';
import { CogniteClient } from '@cognite/sdk';
import { ToastContainer } from '@cognite/cogs.js';
import { I18nContainer } from '@cognite/react-i18n';
import { RecoilRoot } from 'recoil';
import { createBrowserHistory } from 'history';
import * as Sentry from '@sentry/react';
import { Integrations } from '@sentry/tracing';
import SentryRRWeb from '@sentry/rrweb';
import Routes from './Routes';
import config from './config/config';

const history = createBrowserHistory();

if (
  process.env.REACT_APP_SENTRY_DSN &&
  ['staging', 'production'].includes(process.env.REACT_APP_ENV || '')
) {
  Sentry.init({
    dsn: process.env.REACT_APP_SENTRY_DSN,
    // This is populated by the FAS build process. Change it if you want to
    // source this information from somewhere else.
    release: process.env.REACT_APP_RELEASE_ID,
    // This is populated by react-scripts. However, this can be overridden by
    // the app's build process if you wish.
    environment: config.environment,
    integrations: [
      new Integrations.BrowserTracing({
        routingInstrumentation: Sentry.reactRouterV5Instrumentation(history),
      }),
      new SentryRRWeb(),
    ],
    tracesSampleRate: 1,
  });
  Sentry.setTag('rrweb.active', 'yes');
}

const queryClient = new QueryClient({
  defaultOptions: {
    mutations: {
      retry: false,
    },
    queries: {
      cacheTime: 60000,
      staleTime: 60000,
    },
  },
});

const sdk = new CogniteClient({
  appId: 'Cognite Charts',
});

export default function RootApp() {
  return (
    <Sentry.ErrorBoundary fallback={<p>An error has occurred</p>} showDialog>
      <I18nContainer>
        <RecoilRoot>
          <QueryClientProvider client={queryClient}>
            <SDKProvider sdk={sdk}>
              <Router history={history}>
                <ToastContainer />
                <Routes />
              </Router>
              <ReactQueryDevtools />
            </SDKProvider>
          </QueryClientProvider>
        </RecoilRoot>
      </I18nContainer>
    </Sentry.ErrorBoundary>
  );
}
