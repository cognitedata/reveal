import { useEffect } from 'react';

import {
  QueryClient,
  useInfiniteQuery,
  UseInfiniteQueryOptions,
  useQuery,
  UseQueryOptions,
} from '@tanstack/react-query';
import { BASE_QUERY_KEY } from '@transformations/common';

import { CogniteClient, CogniteError } from '@cognite/sdk';
import { useSDK } from '@cognite/sdk-provider';

export type PrimitiveProperty = {
  type:
    | 'boolean'
    | 'float32'
    | 'float64'
    | 'int32'
    | 'int64'
    | 'timestamp'
    | 'date'
    | 'json'
    | 'text';
  list?: boolean;
};

export type DirectNodeRelation = {
  type: 'direct';
  source?: {
    type: 'view';
    space: string;
    externalId: string;
    version: string;
  };
};

export type ViewPropertyDefinitionType =
  // | TextProperty
  PrimitiveProperty | DirectNodeRelation;

export type ViewPropertyDefinition = {
  nullable?: boolean;
  autoIncrement?: boolean;
  defaultValue?: any;
  description?: string;
  name?: string;
  type: ViewPropertyDefinitionType;
};

export type ConnectionDefinition = {
  type: {
    type: undefined;
    space: string;
    externalId: string;
  };
  name?: string;
  description?: string;
  source: {
    type: 'view';
    space: string;
    externalId: string;
    version: string;
  };
  direction?: 'outwards' | 'inwards';
};

type ViewProperty = ViewPropertyDefinition | ConnectionDefinition;

export type ViewDefinition = {
  space: string;
  externalId: string;
  name?: string;
  description?: string;
  version: string;
  createdTime: number;
  writable: boolean;
  usedFor: 'node' | 'edge' | 'all';
  properties: Record<string, ViewProperty>;
};

export const isConnectionDefinition = (
  p: ViewProperty
): p is ConnectionDefinition => {
  return (
    (p as ConnectionDefinition).direction === 'outwards' ||
    (p as ConnectionDefinition).direction === 'inwards'
  );
};

export type DataModel = {
  space: string;
  externalId: string;
  name?: string;
  description?: string;
  version: string;
  // requires inlineView=True in requests
  views: ViewDefinition[];
};

type DataModelResponse = {
  items: DataModel[];
  nextCursor?: string;
};

const headers = { 'cdf-version': 'alpha' };

export const dataModelsCacheKey = (): string[] => ['dms', 'data-models'];
export const dataModelCacheKey = (
  externalId: string,
  space: string,
  version: string
): string[] => ['dms', 'data-models', externalId, space, version];

export const useModels = (
  options?: UseInfiniteQueryOptions<
    DataModelResponse,
    CogniteError,
    DataModelResponse,
    DataModelResponse,
    string[]
  >
) => {
  const sdk = useSDK();
  const query = useInfiniteQuery(
    dataModelsCacheKey(),
    ({ pageParam }) =>
      sdk
        .get<DataModelResponse>(
          `/api/v1/projects/${sdk.project}/models/datamodels`,
          {
            headers,
            params: { cursor: pageParam, inlineViews: true, allVersions: true },
          }
        )
        .then((r) => r.data),

    {
      getNextPageParam: (r) => r.nextCursor,
      ...options,
    }
  );

  useEffect(() => {
    if (query.hasNextPage && !query.isFetching) {
      query.fetchNextPage();
    }
  }, [query]);

  return query;
};

export const getModel = (
  sdk: CogniteClient,
  externalId: string,
  space: string,
  version: string
) =>
  sdk
    .post<DataModelResponse>(
      `/api/v1/projects/${sdk.project}/models/datamodels/byids?inlineViews=true`,
      { data: { items: [{ externalId, space, version }] }, headers }
    )
    .then((r) => r.data.items[0]);

export const useModel = (
  externalId: string,
  space: string,
  version: string,
  options?: UseQueryOptions<DataModel, CogniteError, DataModel, string[]>
) => {
  const sdk = useSDK();
  return useQuery(
    dataModelCacheKey(externalId, space, version),
    () => getModel(sdk, externalId, space, version),
    options
  );
};

export const fetchModel = (
  sdk: CogniteClient,
  client: QueryClient,
  externalId: string,
  space: string,
  version: string
) => {
  return client.fetchQuery(dataModelCacheKey(externalId, space, version), () =>
    getModel(sdk, externalId, space, version)
  );
};

export type DMSSpace = {
  space: string;
  description?: string;
  name?: string;
  createdTime: number;
  lastUpdatedTime: number;
};

type DMSSpaceResponse = {
  items: DMSSpace[];
  nextCursor?: string;
};

const dmsSpacesCacheKey = () => [BASE_QUERY_KEY, 'dms', 'spaces'];

export const useSpaces = (
  options?: UseInfiniteQueryOptions<
    DMSSpaceResponse,
    CogniteError,
    DMSSpaceResponse,
    DMSSpaceResponse,
    string[]
  >
) => {
  const sdk = useSDK();
  const query = useInfiniteQuery(
    dmsSpacesCacheKey(),
    ({ pageParam }) =>
      sdk
        .get<DMSSpaceResponse>(
          `/api/v1/projects/${sdk.project}/models/spaces`,
          { headers, params: { cursor: pageParam, limit: 100 } }
        )
        .then((r) => r.data),

    {
      getNextPageParam: (r) => r.nextCursor,
      ...options,
    }
  );

  useEffect(() => {
    if (query.hasNextPage && !query.isFetching) {
      query.fetchNextPage();
    }
  }, [query]);

  return query;
};
