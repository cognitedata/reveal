import { InternalCommonFilters } from './types';

export const MAX_METADATA_KEYS = 200;

export const DEFAULT_GLOBAL_TABLE_RESULT_LIMIT = 20;

export const DEFAULT_GLOBAL_TABLE_MAX_RESULT_LIMIT = 1000;
export const MORE_THAN_MAX_RESULT_LIMIT = `1K+`;

export const COMMON_FILTER_KEYS: readonly (keyof InternalCommonFilters)[] = [
  'assetSubtreeIds',
  'dataSetIds',
  'createdTime',
  'lastUpdatedTime',
  'externalIdPrefix',
  'internalId',
] as const;

// @deprecated use the constant from the core lib
export const NIL_FILTER_VALUE = 'DATA_EXPLORATION_NO_VALUE_PLACEHOLDER';
// @deprecated use the constant from the core lib
export const NIL_FILTER_LABEL = 'N/A';

export const METADATA_KEY_SEPARATOR = '-';
export const MAX_RESULT_LIMIT_ASSET = 1000;
