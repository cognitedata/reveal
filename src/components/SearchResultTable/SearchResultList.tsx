import { useMemo } from 'react';
import { Icon, Button } from '@cognite/cogs.js';
import { Asset } from '@cognite/sdk';
import {
  useAggregate,
  useCdfItems,
  useInfiniteSearch,
} from '@cognite/sdk-react-query-hooks';
import styled from 'styled-components/macro';
import EmptyResult, {
  defaultTranslations as emptyResultDefaultTranslations,
} from 'components/Search/EmptyResult';
import { makeDefaultTranslations } from 'utils/translations';
import { useTranslations } from 'hooks/translations';
import { SearchFilter } from 'components/Search/Search';
import AssetSearchHit from './AssetSearchHit';
import RecentViewSources from './RecentViewSources';

type Props = {
  query: string;
  filter: SearchFilter;
};

const defaultTranslations = makeDefaultTranslations(
  'Load more',
  'View all',
  'Exact match on external id'
);

export default function SearchResultList({ query, filter }: Props) {
  const rootAssetFilter = filter.rootAsset
    ? { assetSubtreeIds: [{ externalId: filter.rootAsset }] }
    : {};

  const {
    data: resourcesBySearch,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
  } = useInfiniteSearch<Asset>(
    'assets',
    query,
    20,
    { ...rootAssetFilter },
    {
      enabled: !!query,
    }
  );

  const { data: resourcesByExternalId } = useCdfItems<Asset>('assets', [
    { externalId: query },
  ]);

  const assetExactMatch = useMemo(
    () =>
      resourcesByExternalId?.filter(
        ({ externalId }) => externalId === query
      )[0],
    [resourcesByExternalId, query]
  );

  const assets = useMemo(
    () =>
      resourcesBySearch?.pages
        ?.reduce((accl, page) => accl.concat(page), [])
        .filter(({ externalId }) => externalId !== query),
    [resourcesBySearch, query]
  );

  const shouldFetchCount = useMemo(
    () => Boolean(query) && !filter?.showEmpty,
    [query, filter]
  );

  const { data: dataAmount } = useAggregate(
    'timeseries',
    {
      assetIds: assets?.map(({ id }) => id),
      isStep: filter?.isStep,
      isString: filter?.isString,
    },
    { enabled: shouldFetchCount && assets && assets.length > 0 }
  );

  /**
   * Translations
   */
  const t = {
    ...defaultTranslations,
    ...useTranslations(Object.keys(defaultTranslations), 'SearchResults').t,
  };

  const emptyResultTranslations = {
    ...emptyResultDefaultTranslations,
    ...useTranslations(
      Object.keys(emptyResultDefaultTranslations),
      'TimeseriesSearch'
    ).t,
  };

  if (isError) {
    return <Icon type="CloseLarge" />;
  }

  if (isLoading) {
    return <Icon type="Loader" />;
  }

  if (assets?.length === 0 || (shouldFetchCount && dataAmount?.count === 0)) {
    return <EmptyResult translations={emptyResultTranslations} />;
  }

  const exactMatchElement = assetExactMatch && (
    <li key={assetExactMatch.id}>
      <AssetSearchHit
        asset={assetExactMatch}
        query={query}
        filter={filter}
        isExact
      />
    </li>
  );

  const searchResultElements = assets?.map((asset) => (
    <li key={asset.id}>
      <AssetSearchHit asset={asset} query={query} filter={filter} />
    </li>
  ));

  return (
    <AssetList>
      {!query && <RecentViewSources viewType="assets" />}
      {exactMatchElement}
      {searchResultElements}
      {hasNextPage && (
        <Button
          type="link"
          onClick={() => fetchNextPage()}
          style={{ marginBottom: '20px' }}
        >
          {t['Load more']}
        </Button>
      )}
    </AssetList>
  );
}

const AssetList = styled.ul`
  height: 100%;
  list-style: none;
  padding: 0 10px 0 0;
  margin: 0;
`;
