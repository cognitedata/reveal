import {
  Asset,
  AssetFilterProps,
  CogniteClient,
  CogniteError,
} from '@cognite/sdk';
import { useSDK } from '@cognite/sdk-provider';
import {
  QueryClient,
  QueryKey,
  useInfiniteQuery,
  UseInfiniteQueryOptions,
  useQuery,
  UseQueryOptions,
} from '@tanstack/react-query';
import { PropertyAggregate, PropertyAggregateResponse } from 'common/types';

const assetRootKey = ['assets'];

const useAssetsKey = (limit: number, filter?: AssetFilterProps): QueryKey => [
  ...assetRootKey,
  'list',
  { limit, filter },
];

export const useAssets = (
  limit: number,
  filter?: AssetFilterProps,
  opts?: UseInfiniteQueryOptions<
    { items: Asset[]; nextPage?: string },
    CogniteError
  >
) => {
  const sdk = useSDK();
  return useInfiniteQuery(
    useAssetsKey(limit, filter),
    ({ pageParam }) => sdk.assets.list({ cursor: pageParam, filter, limit }),
    {
      getNextPageParam(lastPage) {
        return lastPage.nextPage;
      },
      ...opts,
    }
  );
};

const useAssetSearchKey = (
  query: string,
  filter?: AssetFilterProps
): QueryKey => [...assetRootKey, , 'search', query, { filter }];

export const useAssetSearch = <T>(
  query: string,
  opts?: UseQueryOptions<Asset[], CogniteError, T>
) => {
  const sdk = useSDK();
  return useQuery(
    useAssetSearchKey(query),
    () => sdk.assets.search({ search: { query }, limit: 1000 }),

    opts
  );
};

export const getPropertiesAggregateKey = (): QueryKey => [
  ...assetRootKey,
  'properties-aggregate',
];

/**
 * NOTE: metadata aggreates are always downcased since metadata filters are case-insensitive.
 */
export const getPropertiesAggregate = async (sdk: CogniteClient) => {
  const topLevelProperties: PropertyAggregate[] = [
    { values: [{ property: ['name'] }] },
    { values: [{ property: ['description'] }] },
    { values: [{ property: ['source'] }] },
  ];
  return sdk
    .post<PropertyAggregateResponse>(
      `/api/v1/projects/${sdk.project}/assets/aggregate`,
      {
        headers: {
          'cdf-version': 'alpha',
        },
        data: { aggregate: 'uniqueProperties', path: ['metadata'] },
      }
    )
    .then((r) => {
      if (r.status === 200) {
        return [...topLevelProperties, ...r.data.items];
      } else {
        return Promise.reject(r);
      }
    });
};

export const fetchProperties = async (sdk: CogniteClient, qc: QueryClient) => {
  return qc.fetchQuery(getPropertiesAggregateKey(), () =>
    getPropertiesAggregate(sdk)
  );
};

export const useProperties = (
  options?: UseQueryOptions<PropertyAggregate[], CogniteError>
) => {
  const sdk = useSDK();
  return useQuery(
    getPropertiesAggregateKey(),
    () => getPropertiesAggregate(sdk),
    options
  );
};
