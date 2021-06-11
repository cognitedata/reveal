import { BrowserOptions, init, setUser } from '@sentry/browser';

import { log } from './log';
import { isLocalhost } from './env';

export const getReleaseSha = () =>
  (
    process.env.REACT_APP_RELEASE_ID ||
    process.env.REACT_APP_VERSION_SHA ||
    process.env.REACT_APP_RELEASE ||
    ''
  ).substring(0, 8);

export interface SentryProps {
  // EG:
  // ignoreErrors: [
  //   'Network request failed',
  //   'Network Error',
  //   'A network error (such as timeout, interrupted connection or unreachable host) has occurred.',
  //   'timeout of 0ms exceeded',
  //   "InvalidStateError: Failed to execute 'transaction' on 'IDBDatabase': The database connection is closing.",
  //   'Unauthorized | code: 401',
  //   'Request failed with status code 401',
  //   'Resource not found. This may also be due to insufficient access rights. | code: 403',
  //   'Model not found | code: 404',
  // ],
  ignoreErrors?: string[];
  dsn?: string;
}

export const initSentry = ({ ignoreErrors, dsn }: SentryProps) => {
  const chosenDsn = dsn || process.env.REACT_APP_SENTRY_DSN;
  if (!chosenDsn) {
    log('Sentry DSN not found. Not initializing Sentry.', [], 2);
    return;
  }

  const enabled = !isLocalhost();
  if (!enabled) {
    log('Sentry disabled for localhost.', [], 1);
    return;
  }

  const config: BrowserOptions = {
    dsn: chosenDsn,
    release: getReleaseSha(),
    enabled,

    // This is populated by react-scripts. However, this can be overridden by
    // the app's build process if you wish.
    environment:
      process.env.REACT_APP_ENV || process.env.NODE_ENV || 'development',

    ignoreErrors,
  };

  init(config);
};

export const identifySentry = (email: string, id?: string) => {
  setUser({
    email,
    id,
  });
};
