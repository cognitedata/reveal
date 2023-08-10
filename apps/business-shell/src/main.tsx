// import { StrictMode } from 'react';
import * as Sentry from '@sentry/react';
import { createRoot } from 'react-dom/client';

import { AppWrapper } from './AppWrapper';

window.global ||= window;

Sentry.init({
  // Report to flexible-data-explorer sentry tag, for now!
  dsn: 'https://fd9c0aa445453322d25f01db4bd7f14b@o124058.ingest.sentry.io/4505631562596352',
  integrations: [
    new Sentry.BrowserTracing({
      // Set 'tracePropagationTargets' to control for which URLs distributed tracing should be enabled
      tracePropagationTargets: ['localhost', 'https://apps.cognite.com/'],
    }),
    new Sentry.Replay(),
  ],
  // Performance Monitoring
  tracesSampleRate: 1.0, // Capture 100% of the transactions, reduce in production!
  // Session Replay
  replaysSessionSampleRate: 0.1, // This sets the sample rate at 10%. You may want to change it to 100% while in development and then sample at a lower rate in production.
  replaysOnErrorSampleRate: 1.0, // If you're not already sampling the entire session, change the sample rate to 100% when sampling sessions where errors occur.
  environment: process.env.NODE_ENV,
  enabled: process.env.NODE_ENV !== 'development',
});

const root = createRoot(document.getElementById('root')!);
root.render(<AppWrapper />);
