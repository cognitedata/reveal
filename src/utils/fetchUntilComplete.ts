import noop from 'lodash-es/noop';

type Options<T> = {
  /* check data to see if there is no calls needed */
  isCompleted: (data: T) => boolean;

  /* latest received response that passess isCompleted check (also matches the last onTick event) */
  onComplete?: (data: T) => unknown;

  /* intermediate response that doesn't pass isCompleted check */
  onTick?: (data: T) => unknown;

  onError?: (error: Error) => unknown;

  pollingInterval?: number;
};

export async function fetchUntilComplete<Data>(
  fn: () => Promise<Data>,
  {
    isCompleted,
    onComplete = noop,
    onTick = noop,
    onError = noop,
    pollingInterval = 7000,
  }: Options<Data>
) {
  try {
    const data = await fn();
    onTick(data);
    if (isCompleted(data)) {
      onComplete(data);
    } else {
      setTimeout(
        () =>
          fetchUntilComplete(fn, {
            isCompleted,
            onComplete,
            onTick,
            onError,
            pollingInterval,
          }),
        pollingInterval
      );
    }
  } catch (e) {
    onError(e);
  }
}
