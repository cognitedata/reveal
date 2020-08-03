import zipObject from 'lodash/zipObject';
import flatten from 'lodash/flatten';

export const arrayToObject = <T extends { id: any }>(rows: T[]) => {
  return rows.reduce(
    (prev: { [key: string]: T }, curr: T) => ({ ...prev, [curr.id]: curr }),
    {} as { [key: string]: T }
  );
};

export async function callUntilCompleted(
  networkFn: () => Promise<{ status: number; data: { status: string } }>,
  completeCheckFn: (data: any) => boolean = () => true,
  onCompleteFn: (data?: any) => void = () => {},
  tickFn: (data: any) => void = () => {},
  errorFn: (status: any) => void = () => {},
  interval: number = 1000
) {
  try {
    const { status, data } = await networkFn();
    if (status === 200) {
      tickFn(data);
      if (completeCheckFn(data)) {
        onCompleteFn(data);
      } else {
        setTimeout(
          () =>
            callUntilCompleted(
              networkFn,
              completeCheckFn,
              onCompleteFn,
              tickFn,
              errorFn,
              interval
            ),
          interval
        );
      }
    } else {
      throw new Error('Server error');
    }
  } catch (e) {
    errorFn(e);
  }
}

// TODO text?
export const stripWhitespace = (text: string) =>
  text ? text.replace(/\s/g, '').toLowerCase() : text;

// TODO: fix proper generics typing
export function mergeItems(
  newStuff: any[],
  oldStuff: any = {},
  key: number | string = 'id'
) {
  const ids: any = newStuff.map(a => a[key]);
  return {
    ...oldStuff,
    ...zipObject(ids, newStuff),
  };
}

export const sleep = (milliseconds: number) => {
  return new Promise(resolve => setTimeout(resolve, milliseconds));
};

async function oneAtATime<T, K>(
  fn: (data: T) => Promise<K>,
  data: T[],
  results: K[] = []
): Promise<K[]> {
  if (data.length === 0) {
    return results;
  }
  const [d, ...rest] = data;
  const r = await fn(d);
  return oneAtATime(fn, rest, [...results, r]);
}

export async function boundedParallelRequests<T, K>(
  fn: (data: T) => Promise<K>,
  data: T[],
  n: number
): Promise<K[]> {
  const requestGroups = data.reduce(
    (accl: T[][], d: T, i: number) => {
      accl[i % accl.length].push(d);
      return accl;
    },
    [...Array(n).keys()].map(() => [] as T[])
  );

  const resultGroups = await Promise.all(
    requestGroups.map(group => oneAtATime(fn, group))
  );

  return flatten(resultGroups);
}

export const stuffForUnitTests = {
  oneAtATime,
};
