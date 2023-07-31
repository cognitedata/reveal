import isEmpty from 'lodash/isEmpty';
import { doReAuth } from 'utils/getCogniteSDKClient';

import { reportException } from '@cognite/react-errors';

import { showErrorMessage } from 'components/Toast';
import { SERVICE_ERROR_MESSAGE } from 'constants/error';

import { getSafeError } from './getSafeError';
import { PossibleError } from './types';

export const handleServiceError = <ErrorResponseType>(
  error: PossibleError,
  errorResponse: ErrorResponseType = {} as ErrorResponseType,
  errorMessage?: string
) => {
  const safeError = getSafeError(error);
  const { message, status, errors } = safeError;

  // Handle 401 error
  if (status === 401) {
    doReAuth();
    showErrorMessage(errorMessage || message || SERVICE_ERROR_MESSAGE);
    return errorResponse;
  }

  // Handle 400 error
  if (!isEmpty(errors)) {
    errors.forEach((error) => {
      showErrorMessage(error.message);
    });
  } else {
    showErrorMessage(errorMessage || message || SERVICE_ERROR_MESSAGE);
  }

  // Report exception to Sentry
  reportException(error);

  return errorResponse;
};
