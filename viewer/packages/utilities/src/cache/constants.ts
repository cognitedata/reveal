/*!
 * Copyright 2025 Cognite AS
 */
export const DEFAULT_MAX_CACHE_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days
export const CACHE_NAME = 'reveal-3d-resources-v1';
export const METADATA_CACHE_KEY = 'reveal_cache_metadata';
export const BYTES_PER_KB = 1024;

const ONE_GB_IN_BYTES = BYTES_PER_KB * BYTES_PER_KB * BYTES_PER_KB;

export const DEFAULT_MOBILE_STORAGE_LIMIT = ONE_GB_IN_BYTES;
export const DEFAULT_TABLET_STORAGE_LIMIT = 5 * ONE_GB_IN_BYTES;
export const DEFAULT_DESKTOP_STORAGE_LIMIT = 10 * ONE_GB_IN_BYTES;
export const DEFAULT_HIGHEND_STORAGE_LIMIT = 20 * ONE_GB_IN_BYTES;
