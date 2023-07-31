/* eslint-disable no-bitwise */

/** Replace all characters except for alphanumeric characters, dashes and periods with underscores */
export const sanitizeValue = (value: string) =>
  value.replace(/[^-.\w]+/g, '_').replace('/', '_');

/** DJB2a non-cryptographic hash function */
export const hashCode = (input: string) =>
  Array.from(input).reduce(
    (hash, char) => 0 | ((33 * hash) ^ char.charCodeAt(0)),
    5381
  );

/** Convert array of records to delimiter-separated values */
export function recordsToDsv(records: [], delimiter?: string): null;
export function recordsToDsv<T extends number | string>(
  records: Record<string, T>[],
  delimiter?: string
): string;
export function recordsToDsv<T extends number | string>(
  records: Record<string, T>[],
  delimiter = '\t'
): string | null {
  if (!records.length) {
    return null;
  }
  const columns = Object.keys(records[0]);
  return [
    columns,
    ...records.map((row) =>
      columns.reduce<T[]>((acc, cur) => [...acc, row[cur]], [])
    ),
  ]
    .map((row) => row.join(delimiter))
    .join('\n');
}
