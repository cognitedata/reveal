import { HttpError } from '@cognite/sdk';

/**
 * A type guard to tell if the given {@code error} is an instance of an
 * {@code HttpError} from {@code @cognite/sdk}.
 *
 * @param error {@code} Error instance to check
 * @returns {@code true} if it is an {@code HttpError}
 */
export const isHttpError = (error: Error): error is HttpError => {
  return (error as HttpError).status !== undefined;
};
