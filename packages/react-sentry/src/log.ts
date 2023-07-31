import { isDevelopment } from './env';

export const log = <T>(
  message: string,
  data: T[] = [],
  // data: T | T[] | Record<string, unknown> = [], // how to do this?
  level = 3
) => {
  const safeData = isIterable(data) ? data : [data];

  if (level === 1) {
    // normal logs can only be shown in development mode
    if (isDevelopment) {
      // eslint-disable-next-line no-console
      console.log(message, ...safeData);
    }
  }
  if (level === 2) {
    // eslint-disable-next-line no-console
    console.warn(message, ...safeData);
  }
  if (level === 3) {
    // eslint-disable-next-line no-console
    console.error(message, ...safeData);
  }
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isIterable(possiblyIterable: any) {
  // checks for null and undefined
  if (possiblyIterable == null) {
    return false;
  }
  return typeof possiblyIterable[Symbol.iterator] === 'function';
}
