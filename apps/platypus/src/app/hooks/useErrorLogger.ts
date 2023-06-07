import * as Sentry from '@sentry/browser';

export const useErrorLogger = () => {
  const log = (err: Error) => {
    // I want to see the errors in the console as well
    // eslint-disable-next-line no-console
    console.error(err);

    Sentry.captureException(err);
  };

  return {
    log,
  };
};
