import {
  UseQueryOptions,
  UseInfiniteQueryOptions,
  useInfiniteQuery,
  useQuery,
} from '@tanstack/react-query';
import { isEqual as equal } from 'lodash';
import { IDPType } from '@cognite/login-utils';
import {
  AggregateResponse,
  CogniteClient,
  Group,
  IdEither,
  SingleCogniteCapability,
} from '@cognite/sdk';
import { useSDK } from '@cognite/sdk-provider';
import {
  aggregateKey,
  byIdKey,
  listGroupsKey,
  infiniteListCacheKey,
  infiniteSearchCacheKey,
  listKey,
  retrieveItemsKey,
  searchCacheKey,
  capabilitiesKey,
} from '../keys';

import { aggregateApi, post, listApi as _listApi, searchApi } from '../api';

/**
 * @deprecated this was exported out of the package by mistake, will be removed
 */
export const aggregate = aggregateApi;
/**
 * @deprecated this was exported out of the package by mistake, will be removed
 */
export const listApi = _listApi;

/**
 * The valid resoruce types these hooks are intended to work with
 */
export type SdkResourceType =
  | 'assets'
  | 'timeseries'
  | 'sequences'
  | 'files'
  | 'events'
  | 'datasets'
  | 'extpipes'
  | 'labels'
  | 'groups';

type ErrorResponse = { message?: string };

/**
 * ## Example
 * ```typescript
 * const { data } = useAggregate('assets', { dataSetIds: [{id: 5334549879450276}]} );
 * console.log(data?.count)
 * ```
 */
export const useAggregate = (
  type: SdkResourceType,
  filter: any,
  config?: UseQueryOptions<AggregateResponse, ErrorResponse>
) => {
  const sdk = useSDK();

  return useQuery<AggregateResponse, ErrorResponse>(
    aggregateKey(type, filter),
    () => aggregateApi(sdk, type, filter),
    config
  );
};

/**
 * ## Example
 * ```typescript
 * const { data: myAsset, isFetched } = useCdfItem('assets', 2173222508977208, { cacheTime: 42 });
 * const { data: myTs, isFetched } = useCdfItem('timeseries', 16341836877020, { enabled: isFetched });
 * ```
 */
export const useCdfItem = <T>(
  type: SdkResourceType,
  id: IdEither,
  config?: UseQueryOptions<T, ErrorResponse>
) => {
  const sdk = useSDK();
  const ids = [id];
  return useQuery<T, ErrorResponse>(
    byIdKey(type, id),
    () => post(sdk, `/${type}/byids`, { items: ids }).then((d) => d?.items[0]),
    config
  );
};

/**
 * ## Example
 * ```typescript
 * const { data: twoAssets } = useCdfItems('assets',[{id: 42}, {externalId: 'everything'}]);
 * ```
 */
export const useCdfItems = <T>(
  type: SdkResourceType,
  ids: IdEither[],
  ignoreUnknownIds = false,
  config?: UseQueryOptions<T[], ErrorResponse>
) => {
  const sdk = useSDK();

  const sortedIds = ids
    .filter((i: any) => !!i.id || !!i.externalId)
    .sort((a: any, b: any) =>
      `${a?.id}${a?.externalId}`.localeCompare(`${b?.id}${b?.externalId}`)
    );

  return useQuery<T[], ErrorResponse>(
    retrieveItemsKey(type, sortedIds),
    () => {
      if (sortedIds.length > 0) {
        return post(sdk, `/${type}/byids`, {
          items: sortedIds,
          ignoreUnknownIds,
        }).then((d) => d?.items);
      }
      return [];
    },
    config
  );
};

/**
 * ## Example
 * ```typescript
 * const { data: events } = useList('events');
 * const { data: assets } = useList('assets', { filter: { dataSetIds: [{id: 5334549879450276}]} })
 * ```
 */
export const useList = <T>(
  type: SdkResourceType,
  body?: any,
  config?: UseQueryOptions<T[]>,
  noCleanUp = false
) => {
  const sdk = useSDK();

  const processedBody = noCleanUp ? body : cleanupBody(body);

  return useQuery<T[]>(
    listKey(type, processedBody),
    () => _listApi(sdk, type, processedBody),
    config
  );
};

/**
 * ## Example
 * ```typescript
 * const { data: searchResult } = useSearch('assets', '10 19');
 * ```
 */
export const useSearch = <T>(
  type: SdkResourceType,
  query: string,
  body?: any,
  config?: UseQueryOptions<T[]>
) => {
  const sdk = useSDK();
  const processedBody = cleanupBody(body);

  return useQuery<T[]>(
    searchCacheKey(type, query, processedBody),
    () => searchApi<T>(sdk, type, query, processedBody),
    config
  );
};

/**
 * ## Example
 * ```typescript
 * const { data: searchResult, hasNextPage, fetchNextPage } = useInfiniteList('assets', '10 19');
 * ```
 */
export const useInfiniteSearch = <T>(
  type: SdkResourceType,
  query: string,
  limit: number = 10,
  filter?: any,
  config?: UseInfiniteQueryOptions<T[]>
) => {
  const sdk = useSDK();

  return useInfiniteQuery<T[]>(
    infiniteSearchCacheKey(type, query, filter),
    async ({ pageParam: offset }) => {
      const offsetLimit = offset ? limit + offset : limit;
      const body = filter
        ? { filter, limit: offsetLimit }
        : { limit: offsetLimit };
      const result = await searchApi<T>(sdk, type, query, body);

      if (offset) {
        return result.slice(offset, offset + limit);
      }
      return result;
    },
    {
      getNextPageParam: (page, allPages) => {
        const itemCount = allPages.reduce((accl, p) => accl + p.length, 0);
        if (page.length === limit) {
          return itemCount;
        }
        return undefined;
      },
      ...config,
    }
  );
};

/**
 * ## Example
 * ```typescript
 * const { data, hasNextPage, fetchNextPage } = useInfiniteList('assets', 10);
 * ```
 */
export const useInfiniteList = <T>(
  type: SdkResourceType,
  limit: number = 100,
  filter?: any,
  config?: UseInfiniteQueryOptions<{ items: T[]; nextCursor?: string }>
) => {
  const sdk = useSDK();

  return useInfiniteQuery<{ items: T[]; nextCursor?: string }>(
    infiniteListCacheKey(type, filter),
    ({ pageParam }) =>
      post(
        sdk,
        `/${type}/list`,
        cleanupBody({
          limit,
          filter,
          cursor: pageParam,
        })
      ),
    { getNextPageParam: (r) => r?.nextCursor, ...config }
  );
};

const cleanupBody = (body?: any) => {
  let processedBody: any | undefined = { ...body };
  if (
    processedBody.filter &&
    typeof processedBody.filter === 'object' &&
    Object.keys(processedBody.filter).length === 0
  ) {
    // filter should always be non-empty
    delete processedBody.filter;
  }
  // body should always be non-empty
  if (Object.keys(processedBody).length === 0) {
    processedBody = undefined;
  }
  return processedBody;
};

/**
 * This hook uses the groups API for legacy auth flow and token/inspect for OIDC.
 * It returns false until the groups are fetched. You can use `isLoading` or
 * `isFetching` booleans to check loading state.
 *
 * If you don't provide a scope parameter, it will check if the user has the
 * capability for **any** scope.
 *
 * ## Example
 * ```typescript
 * const { data: hasAssetRead } = usePermissions(flow, 'assetsAcl', 'READ');
 * const { data: hasAssetWrite} = usePermissions(flow, 'assetsAcl', 'WRITE');
 * const { data: hasAssetRead } = usePermissions(flow, 'assetsAcl', 'READ', { all: {} });
 * ```
 */

export const usePermissions = (
  flow: IDPType,
  capability: string,
  action?: string,
  scope?: any,
  options?: UseQueryOptions<Capability[]>
) => {
  const { data, ...queryProps } = useCapabilities(flow, options);
  const capabilities =
    data?.filter(
      (c) => c.acl === capability && (scope ? equal(c.scope, scope) : true)
    ) ?? [];

  return {
    ...queryProps,
    data:
      !!capabilities.length &&
      (action
        ? capabilities.some((c) =>
            c.actions.some((a) => a.toLowerCase() === action.toLowerCase())
          )
        : true),
  };
};

/**
 * A hook to lookup a group in cdf.
 *
 * @param name the group name you want to find
 * @returns the result of useQuery plus a data field with Group | undefined
 */
export const useGroup = (
  name: string,
  config?: Omit<UseQueryOptions<Group[], ErrorResponse>, 'queryKey'>
) => {
  const sdk = useSDK();
  const request = useQuery(
    listGroupsKey({ all: true }),
    () => sdk.groups.list({ all: true }),
    config
  );
  return {
    ...request,
    data: (request.data || []).find((group) => group.name === name),
  };
};

type Capability = {
  acl: string;
  actions: string[];
  scope: any;
};
const groupCapabilities = async (sdk: CogniteClient) => {
  const groups = await sdk.groups.list();
  const capabilities: Capability[] = [];

  groups.forEach((g) => {
    g.capabilities?.forEach((c) => {
      const acl = Object.keys(c).filter((k) =>
        k.includes('Acl')
      )[0] as keyof SingleCogniteCapability;
      const { actions, scope }: { actions: string[]; scope: any } = c[acl];

      const preExisting = capabilities.find(
        (c) => c.acl === acl && equal(scope, c.scope)
      );

      if (preExisting) {
        preExisting.actions = preExisting.actions.concat(actions);
      } else {
        capabilities.push({
          acl,
          actions,
          scope,
        });
      }
    });
  });
  return capabilities.map((c) => ({
    ...c,
    actions: [...new Set(c.actions)],
  }));
};

const tokenCapability = async (sdk: CogniteClient): Promise<Capability[]> => {
  const { data } = await sdk.get('/api/v1/token/inspect');

  const capabilities: any[] = data.capabilities || [];

  return capabilities.map((c) => {
    const acl = Object.keys(c).filter((c) => c.includes('Acl'))[0];
    const actions: string[] = c[acl].actions;
    const scope: any = c[acl].scope;

    return {
      acl,
      actions,
      scope,
    };
  });
};

export const useCapabilities = (
  flow: IDPType,
  options?: UseQueryOptions<Capability[]>
) => {
  const sdk = useSDK();
  const nativeTokens = flow !== 'COGNITE_AUTH';

  return useQuery<Capability[]>(
    capabilitiesKey(),
    () => {
      if (nativeTokens) {
        return tokenCapability(sdk);
      } else {
        return groupCapabilities(sdk);
      }
    },
    options
  );
};
