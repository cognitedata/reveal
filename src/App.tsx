import { Router } from 'react-router-dom';
import { SDKProvider } from '@cognite/sdk-provider';
import { QueryClientProvider, QueryClient } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';
import { ToastContainer } from '@cognite/cogs.js';
import { RecoilRoot } from 'recoil';
import config from 'config/config';
import { IntercomProvider } from 'react-use-intercom';

import 'antd/dist/antd.css';
import '@cognite/cogs.js/dist/cogs.css';
import './config/i18n';
import './config/locale';
import 'services/metrics';

// START SENTRY CODE
import * as Sentry from '@sentry/react';
import { Integrations } from '@sentry/tracing';
import SentryRRWeb from '@sentry/rrweb';
import { isDevelopment } from 'utils/environment';
import { createBrowserHistory } from 'history';
import { getSDK } from 'utils/cdf-sdk';
import Routes from './pages/Routes';

if (!isDevelopment && !config.sentryDSN) {
  throw new Error('SENTRY DSN is not present!');
}

const history = createBrowserHistory();

if (config.sentryDSN && !isDevelopment) {
  Sentry.init({
    dsn: config.sentryDSN,
    release: config.version,
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

// END SENTRY CODE

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

const sdkClient = getSDK();

export default function RootApp() {
  return (
    <Sentry.ErrorBoundary fallback={<p>An error has occurred</p>} showDialog>
      <QueryClientProvider client={queryClient}>
        <IntercomProvider
          appId={config.intercomAppId}
          autoBoot
          initializeDelay={1000}
          autoBootProps={{
            hideDefaultLauncher: true,
            alignment: 'right',
            horizontalPadding: 20,
            verticalPadding: 20,
          }}
        >
          <RecoilRoot>
            <SDKProvider sdk={sdkClient}>
              <Router history={history}>
                <ToastContainer />
                <Routes />
              </Router>
            </SDKProvider>
          </RecoilRoot>
        </IntercomProvider>
        <ReactQueryDevtools />
      </QueryClientProvider>
    </Sentry.ErrorBoundary>
  );
}
