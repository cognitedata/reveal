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

import config from '@charts-app/config/config';
import { useUserInfo } from '@charts-app/hooks/useUserInfo';
import Routes from '@charts-app/pages/Routes';
import { isDevelopment } from '@charts-app/utils/environment';
import * as Sentry from '@sentry/react';
import SentryRRWeb from '@sentry/rrweb';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { RecoilRoot } from 'recoil';

import sdk, { getFlow } from '@cognite/cdf-sdk-singleton';
import { getProject } from '@cognite/cdf-utilities';
import { ToastContainer } from '@cognite/cogs.js';
import { DataExplorationProvider } from '@cognite/data-exploration';
import { FlagProvider } from '@cognite/react-feature-flags';
import { SDKProvider } from '@cognite/sdk-provider';

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
      new SentryRRWeb(),
    ],
    tracesSampleRate: 1,
  });
  Sentry.setTag('rrweb.active', 'yes');
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
      <SDKProvider sdk={sdk}>
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
                  {/* need root for png screenshot when we download chart  */}
                  {/* https://github.com/fayeed/use-screenshot/issues/9#issuecomment-1245094413  */}
                  <div id="root">
                    <Routes />
                  </div>
                </Router>
              </RecoilRoot>
            </Sentry.ErrorBoundary>
          </DataExplorationProvider>
        </GlobalStyles>
        <ReactQueryDevtools initialIsOpen={false} />
      </SDKProvider>
    </FlagProvider>
  );
};
