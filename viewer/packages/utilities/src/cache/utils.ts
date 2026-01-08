/*!
 * Copyright 2025 Cognite AS
 */

import { BINARY_FILES_CACHE_HEADER_DATE, BINARY_FILES_CACHE_HEADER_SIZE } from './constants';

export function safeParseInt(value: string | null | undefined): number | undefined {
  if (!value) return undefined;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? undefined : parsed;
}

export function getCacheDate(response: Response): number | undefined {
  return safeParseInt(response.headers.get(BINARY_FILES_CACHE_HEADER_DATE));
}

export function getCacheSize(response: Response): number | undefined {
  return safeParseInt(response.headers.get(BINARY_FILES_CACHE_HEADER_SIZE));
}
