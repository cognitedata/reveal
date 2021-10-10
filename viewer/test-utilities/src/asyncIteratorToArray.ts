/*!
 * Copyright 2021 Cognite AS
 */
export async function asyncIteratorToArray<T>(it: AsyncIterable<T>): Promise<T[]> {
  const values: T[] = [];
  for await (const v of it) {
    values.push(v);
  }
  return values;
}
