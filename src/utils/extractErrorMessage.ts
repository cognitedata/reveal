import { SerializedError } from '@reduxjs/toolkit/dist/createAsyncThunk';

export const extractErrorMessage = (rawMessage: SerializedError): string =>
  rawMessage && rawMessage.message
    ? JSON.parse(
        rawMessage?.message.substring(rawMessage?.message.indexOf('\n') + 1)
      ).errors[0].message
    : 'Error';
