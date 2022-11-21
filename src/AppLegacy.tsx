/**
 * This is an App file specifically tailored for Legacy Charts.
 * It needs to be separate from Charts in Fusion app due to additional Fusion specific wrappers
 * which are incompatible with Legacy Charts, as well as having different login strategies
 */

import { useEffect } from 'react';
import {
  BrowserRouter as Router,
  useLocation,
  useNavigationType,
  createRoutesFromChildren,
  matchRoutes,
} from 'react-router-dom';
import { SDKProvider } from '@cognite/sdk-provider';
import sdk from '@cognite/cdf-sdk-singleton';
import { QueryClientProvider, QueryClient } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';
import { ToastContainer } from '@cognite/cogs.js';
import { DataExplorationProvider } from '@cognite/data-exploration';
import { RecoilRoot } from 'recoil';
import config from 'config/config';
import { IntercomProvider } from 'react-use-intercom';

import './config/i18n';
import './config/locale';
import 'services/metrics';

import { isDevelopment } from 'utils/environment';
import GlobalStyles from 'styles/GlobalStyles';

// START SENTRY CODE
import * as Sentry from '@sentry/react';
import { BrowserTracing } from '@sentry/tracing';
import SentryRRWeb from '@sentry/rrweb';
import Routes from './pages/Routes';

if (!isDevelopment && !config.sentryDSN) {
  throw new Error('SENTRY DSN is not present!');
}

if (config.sentryDSN && !isDevelopment) {
  Sentry.init({
    dsn: config.sentryDSN,
    release: config.version,
    environment: config.environment,
    integrations: [
      new BrowserTracing({
        routingInstrumentation: Sentry.reactRouterV6Instrumentation(
          useEffect,
          useLocation,
          useNavigationType,
          createRoutesFromChildren,
          matchRoutes
        ),
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

export const RootAppLegacy = () => {
  return (
    <Sentry.ErrorBoundary fallback={<p>An error has occurred</p>} showDialog>
      <SDKProvider sdk={sdk}>
        <QueryClientProvider client={queryClient}>
          <GlobalStyles>
            {/** @ts-ignore */}
            <DataExplorationProvider sdk={sdk}>
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
                  <Router>
                    <ToastContainer />
                    <Routes />
                  </Router>
                </RecoilRoot>
              </IntercomProvider>
              <ReactQueryDevtools />
            </DataExplorationProvider>
          </GlobalStyles>
        </QueryClientProvider>
      </SDKProvider>
    </Sentry.ErrorBoundary>
  );
};
