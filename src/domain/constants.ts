import { InternalCommonFilters } from './types';

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

export const NIL_FILTER_LABEL = 'N/A';
export const NIL_FILTER_VALUE = 'DATA_EXPLORATION_NO_VALUE_PLACEHOLDER';
