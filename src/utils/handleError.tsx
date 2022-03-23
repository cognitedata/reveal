import React from 'react';
import notification from 'antd/lib/notification';
import Paragraph from 'antd/lib/typography/Paragraph';
import { getContainer } from 'utils/utils';

interface ApiError {
  duplicated: [];
  errors: any[];
  failed: any[];
  missing: [];
  requestId: undefined;
  requestIds: [];
  responses: [];
  status: number;
  statuses: any[];
  succeeded: [];
}

interface ErrorNotificationProps extends ApiError {
  message?: string;
  description?: string;
  duration?: number;
}

const generateStatusMessage = (errorCode: number): string | null => {
  switch (errorCode) {
    case 401:
      return 'Your account has insufficient access rights. Contact your project administrator.';
    case 404:
    case 403:
      return 'We could not find what you were looking for. Keep in mind that this may be due to insufficient access rights.';
    case 409:
      return 'External ID cannot be a duplicate. Please choose another external ID.';
    case 500:
    case 503:
      return 'Something went wrong. Please try again in a bit.';
    case undefined:
      return 'We experienced a network issue while handling your request. Please make sure you are connected to the internet and try again.';
    default:
      return null;
  }
};

const generateErrorTitle = (errorMsg?: string) => (
  <Paragraph ellipsis={{ rows: 1, expandable: true }}>{errorMsg}</Paragraph>
);

const generateErrorDescription = (
  error: ApiError,
  customDescription?: string
) => {
  const httpError = generateStatusMessage(error.status);
  const errorMsgs = error.errors?.map((err) => err?.message) ?? null;
  const genericError = `Something went wrong. Please contact Cognite support if the error persists. Error code: ${error.status}`;

  const description =
    customDescription ?? httpError ?? errorMsgs ?? genericError;
  return (
    <Paragraph ellipsis={{ rows: 3, expandable: true }}>
      <strong>{description}</strong>
    </Paragraph>
  );
};

export const handleError = (props: ErrorNotificationProps): void => {
  const { description, duration = 6 } = props;
  const errorObject: ApiError = { ...props };

  const errorTitle = generateErrorTitle('Something went wrong');
  const errorDescription = generateErrorDescription(errorObject, description);

  return notification.error({
    message: errorTitle,
    description: errorDescription,
    duration,
    getContainer,
  });
};

export default handleError;
