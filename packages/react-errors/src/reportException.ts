import * as Sentry from '@sentry/browser';
import isString from 'lodash/isString';

export type SentryPayload = { [key: string]: unknown };

/**
 * Report an exception to Sentry and then return information about that report
 * to the caller. This allows Sentry error IDs to be displayed so that users
 * can include them in their bug reports.
 *
 * @param error Exception to report
 * @param payload Optional payload about the context / situation
 *
 * @returns a {@code ReportedError} instance
 */
export const reportException = (
  error: Error | string,
  payload?: SentryPayload
): Promise<ReportedError> => {
  return new Promise<ReportedError>((resolve) => {
    Sentry.withScope((scope) => {
      const exception = isString(error) ? new Error(error) : error;
      const extras = payload || {};
      // eslint-disable-next-line no-console
      console.error(exception, extras);
      scope.setExtras(extras);
      // This will return an errorId which can be useful for
      // reporting / tracking elsewhere too.
      const errorId = Sentry.captureException(error);
      resolve({ error: exception, errorId });
    });
  });
};

export type ReportedError = {
  error: Error;
  errorId: string;
};
