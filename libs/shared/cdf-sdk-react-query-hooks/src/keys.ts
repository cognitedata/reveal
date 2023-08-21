import { IdEither, ListGroups } from '@cognite/sdk';

import { SdkResourceType } from './hooks';

const rootKey = 'sdk-react-query-hooks';

export const baseCacheKey = (type: SdkResourceType) => [rootKey, 'cdf', type];

export const capabilitiesKey = () => [rootKey, 'capabilities'];

export const annotationsKey = (...extraArgs: string[]) => [
  rootKey,
  'annotations',
  ...extraArgs,
];

export const aggregateKey = (type: SdkResourceType, filter: any) => [
  ...baseCacheKey(type),
  'aggregate',
  filter,
];

export const searchBaseCacheKey = (type: SdkResourceType) => [
  ...baseCacheKey(type),
  'search',
];

export const listBaseCacheKey = (type: SdkResourceType) => [
  ...baseCacheKey(type),
  'list',
];

export const infiniteBaseSearchCacheKey = (type: SdkResourceType) => [
  ...searchBaseCacheKey(type),
  'infinite',
];

export const infiniteBaseListCacheKey = (type: SdkResourceType) => [
  ...listBaseCacheKey(type),
  'infinite',
];

export const byIdKey = (type: SdkResourceType, id: IdEither) => [
  ...baseCacheKey(type),
  'get',
  'byId',
  id,
];

export const infiniteListCacheKey = (
  type: SdkResourceType,
  filter?: any,
  config?: any
) => [...infiniteBaseListCacheKey(type), { filter }, { config }];

export const listKey = (type: SdkResourceType, body: any) => [
  ...listBaseCacheKey(type),
  body,
];

export const retrieveItemsKey = (type: SdkResourceType, ids: IdEither[]) => [
  ...baseCacheKey(type),
  'get',
  'byIds',
  ids,
];

export const searchCacheKey = (
  type: SdkResourceType,
  query: string,
  body?: any
) => [...searchBaseCacheKey(type), query, body].filter((v) => v !== undefined);

export const infiniteSearchCacheKey = (
  type: SdkResourceType,
  query: string,
  filter?: any,
  config?: any
) => [...infiniteBaseSearchCacheKey(type), { query }, { filter }, { config }];

export const listGroupsKey = (scope?: ListGroups) => [
  ...baseCacheKey('groups'),
  scope,
];
