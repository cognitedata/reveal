import isObject from 'lodash/isObject';
import isString from 'lodash/isString';

import { CogniteError } from '@cognite/sdk';

import { DEFAULT_ERROR_MESSAGE, DEFAULT_ERROR_STATUS } from './constants';
import { processCogniteError } from './errorTypeProcessors/processCogniteError';
import { processDefaultError } from './errorTypeProcessors/processDefaultError';
import { PossibleError, SafeError } from './types';

export const getSafeError = (error: PossibleError): SafeError => {
  let safeError: SafeError = {
    message: '',
    status: DEFAULT_ERROR_STATUS,
    errors: [],
  };

  // console.log('error:', error);

  if (isString(error)) {
    safeError.message = error;
  }

  // If type of `error` is `Error`
  safeError = processDefaultError(error as Error, safeError);

  // If type of `error` is `CogniteError`
  safeError = processCogniteError(error as CogniteError, safeError);

  // final fallback processing:
  if (isObject(safeError.message)) {
    try {
      const stringError = JSON.stringify(safeError.message);
      safeError.message = stringError;
    } catch (e) {
      safeError.message = '';
    }
  }

  // set defaults:

  if (!safeError.message) {
    safeError.message = DEFAULT_ERROR_MESSAGE;
  }

  return safeError;
};
