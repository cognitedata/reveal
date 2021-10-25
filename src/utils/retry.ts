const delay = (ms: number): Promise<any> =>
  new Promise((resolve) => setTimeout(resolve, ms));

export async function retry<T>(
  fn: (args: any) => Promise<T>,
  args: any = undefined,
  retries: number = 3,
  interval: number = 1000,
  exponential: boolean = true
): Promise<T> {
  try {
    const val = await fn(args);
    return val;
  } catch (error) {
    if (retries) {
      await delay(interval);
      return retry(
        fn,
        args,
        retries - 1,
        exponential ? interval * 2 : interval,
        exponential
      );
    }
    throw error;
  }
}
