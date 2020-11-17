import * as Sentry from '@sentry/browser';
import notification from 'antd/lib/notification';
import { getContainer } from 'src/utils';
import { isDevelopment } from '@cognite/cdf-utilities';
import { v3 } from '@cognite/cdf-sdk-singleton';

interface ErrorNotificationProps {
  message?: string;
  description?: string;
  error?: v3.HttpError; // Not always the case...
  duration?: number;
}

const generateErrorMessage = (errorCode: number): string => {
  switch (errorCode) {
    case 401:
      return 'Your account has insufficient access rights. Contact your project administrator.';
    case 404:
    case 403:
      return 'We could not find what you were looking for. Keep in mind that this may be due to insufficient access rights.';
    case 500:
    case 503:
      return 'Something went terribly wrong. You can try again in a bit.';
    case undefined:
      return 'We experienced a network issue while handling your request. Please make sure you are connected to the internet and try again.';
    default:
      return `Something went wrong. Please contact Cognite support if the error persists. Error code: ${errorCode}`;
  }
};

export const fireErrorNotification = (
  args: ErrorNotificationProps | string
): void => {
  const {
    message = '3D Models',
    description = '',
    duration = 6,
    error = undefined,
  } = typeof args === 'string' ? { message: args } : args;

  let errorDescription = '';
  if (error && !isDevelopment() && 'status' in error) {
    Sentry.captureException(error);
    errorDescription = generateErrorMessage(error.status);
  }

  notification.error({
    message,
    description: description || errorDescription,
    duration,
    getContainer,
  });
};
