import * as Sentry from '@sentry/browser';

export const useErrorLogger = () => {
  const log = (err: Error) => {
    Sentry.captureException(err);
  };

  return {
    log,
  };
};
