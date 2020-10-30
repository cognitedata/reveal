import {
  captureException as sentoryCaptureException,
  withScope,
} from '@sentry/browser';
import isString from 'lodash/isString';

export const captureException = <T>(
  error: Error | string,
  payload?: T
): Promise<string> => {
  return new Promise<string>((resolve) => {
    withScope((scope) => {
      const exception = isString(error) ? new Error(error) : error;
      const extras = payload || {};
      // eslint-disable-next-line no-console
      console.error(exception, extras);
      scope.setExtras(extras);
      // This will return an errorId which can be useful for
      // reporting / tracking elsewhere too.
      const errorId = sentoryCaptureException(error);
      resolve(errorId);
    });
  });
};
