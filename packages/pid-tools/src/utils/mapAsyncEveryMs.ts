import sleepMs from './sleepMs';

const mapAsyncEveryMs = async <T, U>(
  list: T[],
  fn: (arg: T) => Promise<U>,
  ms: number
): Promise<U[]> => {
  return Promise.all(
    list.map(async (item, i) => {
      await sleepMs(i * ms);

      return fn(item);
    })
  );
};

export default mapAsyncEveryMs;
