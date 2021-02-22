import noop from 'lodash/noop';

type Response<T> = {
  status: number;
  data: T;
};

type Options<T> = {
  /* check data to see if there is no calls needed */
  isCompleted: (data: T) => boolean;

  /* latest received response that passess isCompleted check (also matches the last onTick event) */
  onComplete: (data: T) => unknown;

  /* intermediate response that doesn't pass isCompleted check */
  onTick: (data: T) => unknown;

  onError: (error: unknown) => unknown;

  pollingInterval?: number;
};

export async function fetchUntilComplete<Data>(
  networkFn: () => Promise<Response<Data>>,
  {
    isCompleted,
    onComplete = noop,
    onTick = noop,
    onError = noop,
    pollingInterval = 3000,
  }: Options<Data>
) {
  try {
    const { status, data } = await networkFn();
    if (status === 200) {
      onTick(data);
      if (isCompleted(data)) {
        onComplete(data);
      } else {
        setTimeout(
          () =>
            fetchUntilComplete(networkFn, {
              isCompleted,
              onComplete,
              onTick,
              onError,
              pollingInterval,
            }),
          pollingInterval
        );
      }
    } else {
      onError(`Server error: code ${status}. ${JSON.stringify(data)}`);
    }
  } catch (e) {
    onError(e);
  }
}
