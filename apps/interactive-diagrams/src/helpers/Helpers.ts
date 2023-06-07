import zipObject from 'lodash/zipObject';
import flatten from 'lodash/flatten';

export const arrayToObject = <T extends { id: any }>(rows: T[]) => {
  return rows.reduce(
    (prev: { [key: string]: T }, curr: T) => ({ ...prev, [curr.id]: curr }),
    {} as { [key: string]: T }
  );
};

export async function followCursors<T, K>(
  query: T,
  fn: (q: T) => Promise<{ items: K[]; nextCursor?: string }>
): Promise<{ items: K[] }> {
  const { items, nextCursor } = await fn(query);
  if (nextCursor) {
    const result = await followCursors({ ...query, cursor: nextCursor }, fn);
    return { items: items.concat(result.items) };
  }
  return { items };
}

export async function* followCursorsGenerator<T, K>(
  query: T,
  fn: (q: T) => Promise<{ items: K[]; nextCursor?: string }>
) {
  let items;
  let nextCursor;
  ({ items, nextCursor } = await fn(query));
  yield items;
  while (nextCursor) {
    /* eslint-disable no-await-in-loop */
    ({ items, nextCursor } = await fn({ ...query, cursor: nextCursor }));
    /* eslint-enable no-await-in-loop */
    yield items;
  }
}

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

// eslint-disable-next-line
// TODO text?
export const stripWhitespace = (text: string) =>
  text ? text.replace(/\s/g, '').toLowerCase() : text;

// eslint-disable-next-line
// TODO: fix proper generics typing
export function mergeItems(
  newStuff: any[],
  oldStuff: any = {},
  key: number | string = 'id'
) {
  const ids: any = newStuff.map((a) => a[key]);
  return {
    ...oldStuff,
    ...zipObject(ids, newStuff),
  };
}

export const sleep = (milliseconds: number) => {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
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
    requestGroups.map((group) => oneAtATime(fn, group))
  );

  return flatten(resultGroups);
}

export const stuffForUnitTests = {
  oneAtATime,
};

type ResourceItem = { [key: string]: any };
export const getAllPossibleStringFields = (items: ResourceItem[]) => {
  const possibleFields = items.reduce((accumulator, item) => {
    const keys: Array<keyof ResourceItem> = Object.keys(item);
    keys.forEach((key) => {
      if (!accumulator[key]) {
        if (typeof item[key] === 'string') {
          accumulator[key] = key;
        }
      }
    });
    return accumulator;
  }, {});
  const resourceMetadata = Array.from(
    new Set(
      items.reduce(
        (accl: string[], item: any) =>
          item && item.metadata
            ? accl.concat(Object.keys(item?.metadata))
            : accl,
        []
      )
    ) as Set<string>
  ).map((metadataKey: string) => `metadata.${metadataKey}`);

  return [...Object.keys(possibleFields), ...resourceMetadata];
};
