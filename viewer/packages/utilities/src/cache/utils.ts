/*!
 * Copyright 2025 Cognite AS
 */

import { CACHE_HEADER_DATE, CACHE_HEADER_SIZE } from './constants';

export function safeParseInt(value: string | null | undefined): number {
  if (!value) return 0;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? 0 : parsed;
}

export function getCacheDate(response: Response): number {
  return safeParseInt(response.headers.get(CACHE_HEADER_DATE));
}

export function getCacheSize(response: Response): number {
  return safeParseInt(response.headers.get(CACHE_HEADER_SIZE));
}
