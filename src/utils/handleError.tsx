import React from 'react';

import * as Sentry from '@sentry/browser';
import notification from 'antd/lib/notification';
import { Typography } from 'antd';

import { getContainer } from './utils';

interface ApiError {
  duplicated: any[];
  errors: any[];
  failed: any[];
  missing: any[];
  requestId: undefined;
  requestIds: any[];
  responses: any[];
  status: number;
  statuses: any[];
  succeeded: any[];
}

interface ErrorNotificationProps extends ApiError {
  message?: string;
  description?: string;
  duration?: number;
  sendToSentry?: boolean;
  error?: any;
}

const generateStatusMessage = (errorCode: number): string => {
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

const generateErrorTitle = (error: ApiError, extraMessage?: string) => (
  <Typography.Paragraph ellipsis={{ rows: 1, expandable: true }}>
    {extraMessage || generateStatusMessage(error.status)}
  </Typography.Paragraph>
);

const generateErrorDescription = (
  error: ApiError,
  extraDescription?: string
) => (
  <Typography.Paragraph ellipsis={{ rows: 3, expandable: true }}>
    <strong>{extraDescription}</strong>
    {error.errors?.map((err) => err?.message)}
  </Typography.Paragraph>
);

export const handleError = (props: unknown): void => {
  const {
    message = '',
    description,
    duration = 6,
    status,
    sendToSentry = true,
  } = props as ErrorNotificationProps;
  const errorObject: ApiError = { ...(props as ErrorNotificationProps) };

  const errorTitle = generateErrorTitle(errorObject, message);
  const errorDescription = generateErrorDescription(errorObject, description);

  if (status !== 401 && status !== 403 && sendToSentry) {
    Sentry.captureException(errorObject);
  }

  return notification.error({
    message: errorTitle,
    description: errorDescription,
    duration,
    getContainer,
  });
};

export const fireErrorNotification = ({
  message,
  description,
  duration = 6,
  error,
}: ErrorNotificationProps): void => {
  let errorDescription = '';
  if (error) {
    Sentry.captureException(error);
    errorDescription = generateStatusMessage(error.status);
  }
  notification.error({
    message,
    description: description || errorDescription,
    duration,
    getContainer,
  });
};

export default handleError;
