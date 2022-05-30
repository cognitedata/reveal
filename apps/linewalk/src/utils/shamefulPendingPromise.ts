const shamefulPendingPromise = <T>(): Promise<T> =>
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  new Promise<T>(() => {});

export default shamefulPendingPromise;
