/*!
 * Copyright 2025 Cognite AS
 */

/**
 * Determines if DMS query pagination should continue and returns the cursor.
 * Pagination continues only when the result set reached the limit, indicating more data may exist.
 *
 * @param results - The array of results from the current page
 * @param nextCursor - The cursor object from the DMS response
 * @param cursorKey - The key to extract from the cursor object (e.g., 'images', 'nodes')
 * @param limit - The limit used in the query
 * @returns The cursor string if pagination should continue, undefined otherwise
 *
 */
export function getDmsPaginationCursor(
  results: unknown[] | undefined,
  nextCursor: Record<string, string> | undefined,
  cursorKey: string,
  limit: number
): string | undefined {
  const hasMoreData = results && results.length >= limit;
  const cursor = nextCursor?.[cursorKey];

  return hasMoreData && cursor ? cursor : undefined;
}
