import isNumber from 'lodash/isNumber';
import isObject from 'lodash/isObject';
import isString from 'lodash/isString';

import { SafeError } from '../types';

export const processDefaultError = (
  error: Error,
  safeError: SafeError
): SafeError => {
  const result = safeError;

  if (!result.message && isString(error.message)) {
    try {
      const jsonError = JSON.parse(error.message);
      if (isObject(jsonError) as unknown) {
        if ('message' in jsonError) {
          result.message = jsonError.message;
        }
        if (isNumber(jsonError.code)) {
          result.status = jsonError.code;
        }
        if (jsonError.errors) {
          result.errors = jsonError.errors;
        }
      }
    } catch (e) {
      // no error here, this just wasn't a json error
      // so set the orignial error to the message
      result.message = error.message;
    }
  }

  if (!result.message && isObject(error.message)) {
    try {
      const stringError = JSON.stringify(error.message);
      result.message = stringError;
    } catch (e) {
      result.message = '';
    }
  }

  return result;
};
