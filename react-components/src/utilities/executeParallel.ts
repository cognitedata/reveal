export async function executeParallel<T>(
  callbacks: Array<() => Promise<T>>,
  maxParallel: number
): Promise<Array<T | undefined>> {
  const resultArray = new Array<T | undefined>(callbacks.length).fill(undefined);

  let nextCallback = 0;

  const resultFillingCallbacks = callbacks.map(
    (callback, ind) => async () => await callback().then((value) => (resultArray[ind] = value))
  );

  async function scheduleNext(): Promise<void> {
    if (nextCallback >= resultArray.length) {
      return;
    }

    const relevantCallback = nextCallback;
    nextCallback++;

    await resultFillingCallbacks[relevantCallback]();
    await scheduleNext();
  }

  const scheduleChains = new Array(maxParallel).fill(0).map(async () => {
    await scheduleNext();
  });

  await Promise.all(scheduleChains);
  return resultArray;
}
