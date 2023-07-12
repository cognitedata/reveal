import { Copilot } from '@fusion/copilot-core';
import * as Sentry from '@sentry/react';

import sdk from '@cognite/cdf-sdk-singleton';

Sentry.init({
  dsn: 'https://b6c495cff6c846cb8fce0001e2454177@o124058.ingest.sentry.io/4505515546509312',
  integrations: [new Sentry.Replay()],
  // Performance Monitoring
  tracesSampleRate: 1.0, // Capture 100% of the transactions, reduce in production!
  // Session Replay
  replaysSessionSampleRate: 0.1, // This sets the sample rate at 10%. You may want to change it to 100% while in development and then sample at a lower rate in production.
  replaysOnErrorSampleRate: 1.0, // If you're not already sampling the entire session, change the sample rate to 100% when sampling sessions where errors occur.
});

export const CopilotPage = () => {
  return <Copilot sdk={sdk} />;
};
