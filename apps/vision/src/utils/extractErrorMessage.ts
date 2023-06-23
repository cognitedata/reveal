import { SerializedError } from '@reduxjs/toolkit';

/**
 * Extracts error message
 *
 * message property in rawMessage can be a simple string as well as a stringified json object
 * @param rawMessage
 */
export const extractErrorMessage = (rawMessage: SerializedError): string => {
  let errorMessage = 'Error';
  if (rawMessage && rawMessage.message) {
    try {
      errorMessage = JSON.parse(
        rawMessage?.message.substring(rawMessage?.message.indexOf('\n') + 1)
      ).errors[0].message;
    } catch (error) {
      errorMessage = rawMessage.message;
    }
  }
  return errorMessage;
};
