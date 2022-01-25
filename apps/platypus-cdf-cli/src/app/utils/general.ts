export const promiseWithTimeout = async (
  timeoutMs: number,
  promise: () => Promise<unknown>,
  errMessage: string
) => {
  let timeoutHandle: NodeJS.Timeout;

  const timeoutPromise = new Promise((_, reject) => {
    timeoutHandle = setTimeout(() => reject(errMessage), timeoutMs);
  });

  return Promise.race([promise(), timeoutPromise]).then((result) => {
    clearTimeout(timeoutHandle);
    return result;
  });
};
