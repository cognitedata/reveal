/**
 * This is an App file specifically tailored for Charts in Fusion.
 * It needs to be separate from Legacy Charts app due to additional Fusion specific wrappers
 * which are incompatible with Legacy Charts, as well as using sdk-singleton
 * for authentication related purposes.
 */

import { useEffect } from 'react';
import {
  BrowserRouter as Router,
  useLocation,
  useNavigationType,
  createRoutesFromChildren,
  matchRoutes,
} from 'react-router-dom';

import { DataExplorationProvider } from '@data-exploration-components/context/DataExplorationContext';
import * as Sentry from '@sentry/react';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { RecoilRoot } from 'recoil';

import sdk, { getFlow } from '@cognite/cdf-sdk-singleton';
import { getProject } from '@cognite/cdf-utilities';
import { ToastContainer } from '@cognite/cogs.js';
import { FlagProvider } from '@cognite/react-feature-flags';

import config from './app/config/config';
import { useUserInfo } from './app/hooks/useUserInfo';
import Routes from './app/pages/Routes';
import { isDevelopment } from './app/utils/environment';
import GlobalStyles from './GlobalStyles';

// START SENTRY CODE

if (!isDevelopment && !config.sentryDSN) {
  throw new Error('SENTRY DSN is not present!');
}

if (config.sentryDSN && !isDevelopment) {
  Sentry.init({
    dsn: config.sentryDSN,
    release: config.version,
    environment: config.environment,
    integrations: [
      new Sentry.BrowserTracing({
        routingInstrumentation: Sentry.reactRouterV6Instrumentation(
          useEffect,
          useLocation,
          useNavigationType,
          createRoutesFromChildren,
          matchRoutes
        ),
      }),
    ],
    tracesSampleRate: 1,
  });
}

// END SENTRY CODE

const flow = getFlow();

export const RootApp = () => {
  const { data: userInfo } = useUserInfo();

  return (
    <FlagProvider
      apiToken="v2Qyg7YqvhyAMCRMbDmy1qA6SuG8YCBE"
      appName="cdf-charts-ui"
      projectName={getProject()}
    >
      <GlobalStyles>
        <DataExplorationProvider
          flow={flow.flow}
          userInfo={userInfo}
          sdk={sdk}
          overrideURLMap={{
            pdfjsWorkerSrc:
              '/dependencies/pdfjs-dist@2.6.347/build/pdf.worker.min.js',
          }}
        >
          <Sentry.ErrorBoundary
            // Todo(DEGR-2403) Add a better error placeholder
            fallback={<p>An error has occurred</p>}
            showDialog
          >
            <RecoilRoot>
              <Router>
                <ToastContainer style={{ top: '5em' }} />
                <Routes />
              </Router>
            </RecoilRoot>
          </Sentry.ErrorBoundary>
        </DataExplorationProvider>
      </GlobalStyles>
      <ReactQueryDevtools initialIsOpen={false} />
    </FlagProvider>
  );
};
