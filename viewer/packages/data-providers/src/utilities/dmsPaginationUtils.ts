/*!
 * Copyright 2025 Cognite AS
 */

/**
 * Determines if DMS query pagination should continue and returns the cursor.
 * Pagination continues only when the result set reached the limit, indicating more data may exist.
 *
 * @param results - The array of results from the current page
 * @param nextCursor - The cursor from the DMS response (object with keys or string)
 * @param cursorKey - Optional key to extract from the cursor object (e.g., 'images', 'nodes'). If not provided, treats nextCursor as a string.
 * @param limit - The limit used in the query
 * @returns The cursor string if pagination should continue, undefined otherwise
 *
 */
export function getDmsPaginationCursor(
  results: unknown[] | undefined,
  nextCursor: Record<string, string> | string | undefined,
  cursorKey: string | undefined,
  limit: number
): string | undefined {
  const hasMoreData = results && results.length >= limit;

  let cursor: string | undefined;
  if (cursorKey && typeof nextCursor === 'object' && nextCursor !== null) {
    cursor = nextCursor[cursorKey];
  } else if (!cursorKey && typeof nextCursor === 'string') {
    cursor = nextCursor;
  }

  return hasMoreData && cursor ? cursor : undefined;
}
