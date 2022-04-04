import get from 'lodash/get';
import isNumber from 'lodash/isNumber';
import isString from 'lodash/isString';

import { CogniteError } from '@cognite/sdk';

import { SafeError } from '../types';
import { convertToHttpStatus } from '../utils';

export const processCogniteError = (
  error: CogniteError,
  safeError: SafeError
): SafeError => {
  const result = safeError;

  if ('status' in error) {
    if (isNumber(error.status) && !result.status) {
      result.status = convertToHttpStatus(error.status);
    }

    if (isString(error.status) && !result.message) {
      result.message = error.status;
    }
  }

  if (!result.message && 'errorMessage' in error) {
    result.message = error.errorMessage;
  }

  const validations = get(error, 'extra.validationError', {});
  Object.keys(validations).forEach((key) => {
    result.errors.push({
      message: validations[key],
      status: 400,
    });
  });

  return result;
};
