import { RootDispatcher } from 'store/types';
import { HttpError } from '@cognite/sdk';
import { setError } from 'store/notification/actions';

interface MixedHttpError extends HttpError {
  code: number;
  message: string;
  type: string;
}

export const setHttpError =
  (title: string, httpError: MixedHttpError) =>
  async (dispatch: RootDispatcher) => {
    const { code, status } = httpError;
    const statusCode = status || code;
    dispatch(setError([title, statusCode ? `Status code ${statusCode}` : '']));
  };
