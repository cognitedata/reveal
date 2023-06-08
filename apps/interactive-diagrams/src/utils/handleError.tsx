import React from 'react';

import { ERRORS } from '@interactive-diagrams-app/stringConstants';
import { getContainer } from '@interactive-diagrams-app/utils/utils';
import notification from 'antd/lib/notification';
import Paragraph from 'antd/lib/typography/Paragraph';
import isString from 'lodash/isString';

// To achieve this typing for the props, the error catched should be: handleError({...error})
interface ErrorNotificationProps {
  errorMessage?: { [key: string]: string[] };
  requestId?: number;
  status?: number;
  message?: string;
}

const generateStatusMessage = (errorCode: number, reqId: any): string => {
  const requestId = reqId ?? 'unknown';
  switch (errorCode) {
    case 401:
      return `Your account has insufficient access rights. Contact your project administrator. Request Id: ${requestId}`;
    case 404:
    case 403:
      return `We could not find what you were looking for. Keep in mind that this may be due to insufficient access rights. Request Id: ${requestId}`;
    case 500:
    case 503:
      return `Something went terribly wrong. You can try again in a bit. Request Id: ${requestId}`;
    case undefined:
      return `We experienced a network issue while handling your request. Please make sure you are connected to the internet and try again. Request Id: ${requestId}`;
    default:
      return `Something went wrong. Please contact Cognite support if the error persists. Request Id: ${requestId}`;
  }
};

const generateErrorTitle = (
  status?: number,
  requestId?: string | number,
  message?: string
) => {
  if (status) {
    return <Paragraph>{generateStatusMessage(status, requestId)}</Paragraph>;
  }
  return (
    <Paragraph>{message || generateStatusMessage(0, requestId)}</Paragraph>
  );
};

export const tryToStringify = (message: any) => {
  if (message) {
    try {
      const string = JSON.stringify(message);
      return string;
    } catch (e) {
      return 'Something went wrong. Please contact Cognite support if the error persists.';
    }
  }
  return 'Something went wrong. Please contact Cognite support if the error persists.';
};
const generateErrorDescription = (
  errorMessage: ErrorNotificationProps['errorMessage']
) => {
  if (errorMessage) {
    return (
      <Paragraph ellipsis={{ rows: 3, expandable: true }}>
        {tryToStringify(errorMessage)}
      </Paragraph>
    );
  }
  return '';
};

export const handleError = (props: ErrorNotificationProps): void => {
  const { errorMessage, requestId, status, message = '' } = props;

  const errorTitle = generateErrorTitle(status, requestId, message);
  const errorDescription = generateErrorDescription(errorMessage);

  notification.error({
    message: errorTitle,
    description: errorDescription,
    getContainer,
  });
};

export const translateError = (originalError?: string): string | undefined => {
  if (!originalError || !isString(originalError))
    return 'Something went wrong, please try again';
  const errors = Object.values(ERRORS);
  const error = errors.find((err) => originalError.startsWith(err.startsWith));
  if (error) return error.translation;
  return originalError;
};

export default handleError;
