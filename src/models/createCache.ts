/*!
 * Copyright 2019 Cognite AS
 */

interface FetchResult {
  data: Promise<ArrayBuffer>;
}

type FetchDelegate<T_ID> = (id: T_ID) => Promise<ArrayBuffer>;
type ParseDelegate<T_ID, T> = (id: T_ID, buffer: ArrayBuffer) => Promise<T>;

export function createCache<T_ID, T>(
  fetcher: FetchDelegate<T_ID>,
  parser: ParseDelegate<T_ID, T>
): [FetchDelegate<T_ID>, ParseDelegate<T_ID, T>] {
  const fetchResults = new Map<T_ID, FetchResult>();
  const parseResults = new Map<T_ID, Promise<T>>();

  const fetchCached = async (id: T_ID): Promise<ArrayBuffer> => {
    const existing = fetchResults.get(id);
    if (existing) {
      return existing.data;
    }
    const result: FetchResult = {
      data: fetcher(id)
    };
    fetchResults.set(id, result);
    return result.data;
  };

  const parseCached = async (id: T_ID, data: ArrayBuffer): Promise<T> => {
    const existing = parseResults.get(id);
    if (existing) {
      console.log('Parse cache hit');
      return existing;
    }
    parseResults.set(id, parser(id, data));
    const result = parseResults.get(id);
    if (!result) {
      throw new Error(`Sector ${id} does not exist in cache even though it was just inserted. Aborting.`);
    }
    const parseResult = await result;
    const fetchResult = fetchResults.get(id)!;
    if (!fetchResult) {
      console.log(`WARNING: Cache parsed sector ${id}, but did not find the corresponding fetched data to clear.`);
      return result;
    }
    // Clear the original fetch, since it is no longer needed
    fetchResult.data = Promise.resolve(new ArrayBuffer(0));
    return parseResult;
  };

  return [fetchCached, parseCached];
}
