import { useEffect } from 'react';
import {
  useLocation,
  useNavigationType,
  createRoutesFromChildren,
  matchRoutes,
} from 'react-router-dom';

import { HttpClient as HttpClientIntegration } from '@sentry/integrations';
import * as Sentry from '@sentry/react';

export function setupSentry() {
  Sentry.init({
    // cdf-hub project
    dsn: 'https://e1b43d071a3446bfabfca7d239864bc1@o124058.ingest.sentry.io/5177031',
    integrations: [
      new Sentry.BrowserTracing({
        // See docs for support of different versions of variation of react router
        // https://docs.sentry.io/platforms/javascript/guides/react/configuration/integrations/react-router/
        routingInstrumentation: Sentry.reactRouterV6Instrumentation(
          useEffect,
          useLocation,
          useNavigationType,
          createRoutesFromChildren,
          matchRoutes
        ),
      }),
      new HttpClientIntegration({
        failedRequestStatusCodes: [[400, 599]],
        // failedRequestTargets: [/https:\/\/auth\.cognite\.com/],
      }),
      new Sentry.Replay(),
    ],

    beforeSend: processSentryErrorEvent,

    // Set tracesSampleRate to 1.0 to capture 100%
    // of transactions for performance monitoring.
    tracesSampleRate: 1.0,

    // Capture Replay for 10% of all sessions,
    // plus for 100% of sessions with an error
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
  });
}

function processSentryErrorEvent(event: Sentry.Event): Sentry.Event | null {
  // Be careful when modifying this function, it's called for every error
  // and currently, Sentry is configured to sample at 100%.

  const requestUrl = event.request?.url || '';
  if (!isCogIdPUrl(requestUrl)) {
    return null;
  }

  if (isCogIdPOrgLookupEndpoint(requestUrl)) {
    // we exlucde the org lookup endpoint which is expected to fail (404)
    return null;
  }

  event.extra = getOptionalAnonymousCogIdPSessionData();

  return event;
}

const isCogIdPUrl = (url: string) => url.startsWith('https://auth.cognite.com');

const isCogIdPOrgLookupEndpoint = (url: string) =>
  url.match(/https:\/\/auth\.cognite\.com\/api\/v0\/orgs\/[^/]+\/public/) !==
  null;

const getOptionalAnonymousCogIdPSessionData = (): Record<string, unknown> => {
  try {
    const oidcKey = Object.keys(localStorage).find((key) =>
      key.startsWith('oidc:user:https://auth.cognite.com')
    );
    if (!oidcKey) {
      throw new Error('No OIDC key found');
    }
    const oidcValue = localStorage.getItem(oidcKey);
    if (!oidcValue) {
      throw new Error(`No OIDC value for key ${oidcKey} found`);
    }
    const { expires_at }: { expires_at: number } = JSON.parse(oidcValue);
    return {
      expires_at_timestamp: expires_at,
      expires_at: new Date(expires_at * 1000),
    };
  } catch (e: unknown) {
    if (e instanceof Error) {
      return { error: e.message };
    }
    return {};
  }
};
