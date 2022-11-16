import { InternalCommonFilters } from './types';

export const DEFAULT_GLOBAL_TABLE_RESULT_LIMIT = 20;

export const COMMON_FILTER_KEYS: readonly (keyof InternalCommonFilters)[] = [
  'assetSubtreeIds',
  'dataSetIds',
  'createdTime',
  'lastUpdatedTime',
  'externalIdPrefix',
  'internalId',
] as const;
