import { doReAuth } from 'utils/getCogniteSDKClient';

import { reportException } from '@cognite/react-errors';

import { showErrorMessage } from 'components/toast';

import { SERVICE_ERROR_MESSAGE } from './constants';
import { ServiceError } from './types';

export const handleServiceError = <ErrorResponseType>(
  error: ServiceError,
  errorResponse: ErrorResponseType = {} as ErrorResponseType,
  errorMessage: string = SERVICE_ERROR_MESSAGE
) => {
  // Handle 401 error
  if ('status' in error && error.status === 401) {
    doReAuth();
    showErrorMessage(errorMessage);
    return errorResponse;
  }

  // Handle 400 error
  if (
    'status' in error &&
    error.extra &&
    error.status === 400 &&
    error.extra.validationError
  ) {
    const validations = error.extra.validationError;

    Object.keys(validations).forEach((key) => {
      showErrorMessage(validations[key]);
    });
  } else {
    showErrorMessage(errorMessage);
  }

  // Report exception to Sentry
  reportException(error);

  return errorResponse;
};
