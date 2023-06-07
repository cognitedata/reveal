export function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function pAll<T>(
  queue: (() => Promise<T>)[],
  concurrency: number
) {
  let index = 0;
  const results: T[] = [];

  // Run a pseudo-thread
  const execThread = async () => {
    while (index < queue.length) {
      // eslint-disable-next-line no-plusplus
      const curIndex = index++;
      // Use of `curIndex` is important because `index` may change after await is resolved
      // eslint-disable-next-line no-await-in-loop
      results[curIndex] = await queue[curIndex]();
    }
  };

  // Start threads
  const threads = [];
  for (let thread = 0; thread < concurrency; thread++) {
    threads.push(execThread());
  }
  await Promise.all(threads);
  return results;
}
