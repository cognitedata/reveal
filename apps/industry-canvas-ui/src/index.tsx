import './set-public-path';
import React from 'react';

import * as Sentry from '@sentry/react';
import ReactDOMClient from 'react-dom/client';
import singleSpaReact from 'single-spa-react';

import { getEnvironment } from '@cognite/cdf-utilities';

import { AppWrapper } from './AppWrapper';

if (getEnvironment() === 'production') {
  Sentry.init({
    dsn: 'https://2224caf03cb469976ae74b8234c1f6f2@o124058.ingest.sentry.io/4505873114333184',
    integrations: [
      new Sentry.BrowserTracing({
        // Set 'tracePropagationTargets' to control for which URLs distributed tracing should be enabled
      }),
      new Sentry.Replay(),
    ],
    // Performance Monitoring
    tracesSampleRate: 1.0, // Capture 100% of the transactions
    // Session Replay
    replaysSessionSampleRate: 0.1, // This sets the sample rate at 10%. You may want to change it to 100% while in development and then sample at a lower rate in production.
    replaysOnErrorSampleRate: 1.0, // If you're not already sampling the entire session, change the sample rate to 100% when sampling sessions where errors occur.
  });
}

export const { bootstrap, mount, unmount } = singleSpaReact({
  React,
  ReactDOMClient,
  rootComponent: AppWrapper,
});
