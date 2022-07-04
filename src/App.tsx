import { Router } from 'react-router-dom';
import { SDKProvider } from '@cognite/sdk-provider';
import { QueryClientProvider, QueryClient } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';
import { ToastContainer } from '@cognite/cogs.js';
import { RecoilRoot } from 'recoil';
import { IntercomProvider } from 'react-use-intercom';
import Locale from 'models/charts/user-preferences/classes/Locale';
import I18N from 'models/charts/user-preferences/classes/I18N';

import 'antd/dist/antd.css';
import '@cognite/cogs.js/dist/cogs.css';
import 'services/metrics';

// START SENTRY CODE
import * as Sentry from '@sentry/react';
import { Integrations } from '@sentry/tracing';
import SentryRRWeb from '@sentry/rrweb';
import { isDevelopment } from 'models/charts/config/utils/environment';
import { createBrowserHistory } from 'history';
import { getSDK } from 'utils/cdf-sdk';
import Config from 'models/charts/config/classes/Config';
import Routes from './pages/Routes';

if (!isDevelopment && !Config.sentryDSN) {
  throw new Error('SENTRY DSN is not present!');
}

const history = createBrowserHistory();

if (Config.sentryDSN && !isDevelopment) {
  Sentry.init({
    dsn: Config.sentryDSN,
    release: Config.version,
    environment: Config.environment,
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

I18N.initialize();
Locale.initialize();

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
          appId={Config.intercomAppId}
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
