import React from 'react';

import notification from 'antd/lib/notification';
import { Typography } from 'antd';

import { getContainer } from './utils';
import { Trans, TranslationKeys } from 'common/i18n';

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
  error?: any;
}

const generateStatusMessage = (errorCode: number): TranslationKeys => {
  switch (errorCode) {
    case 401:
      return 'error-insufficient-access';
    case 404:
    case 403:
      return 'error-not-found';
    case 500:
    case 503:
      return 'error-server-error';
    case undefined:
      return 'error-network-issue';
    default:
      return 'error-default';
  }
};

const generateErrorTitle = (error: ApiError, extraMessage?: string) => {
  return (
    <Typography.Paragraph ellipsis={{ rows: 1, expandable: true }}>
      {extraMessage || (
        <Trans
          i18nKey={generateStatusMessage(error.status)}
          values={{ errorCode: error.status }}
        />
      )}
    </Typography.Paragraph>
  );
};

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
  } = props as ErrorNotificationProps;
  const errorObject: ApiError = { ...(props as ErrorNotificationProps) };

  const errorTitle = generateErrorTitle(errorObject, message);
  const errorDescription = generateErrorDescription(errorObject, description);

  return notification.error({
    message: errorTitle,
    description: errorDescription,
    duration,
    getContainer,
  });
};

export default handleError;
