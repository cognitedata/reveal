import { useMemo } from 'react';
import { Icon, Button } from '@cognite/cogs.js';
import { Asset } from '@cognite/sdk';
import { useCdfItems, useInfiniteSearch } from '@cognite/sdk-react-query-hooks';
import styled from 'styled-components/macro';
import { makeDefaultTranslations } from 'utils/translations';
import { useTranslations } from 'hooks/translations';
import AssetSearchHit from './AssetSearchHit';
import RecentViewSources from './RecentViewSources';

type Props = {
  query: string;
};
const defaultTranslation = makeDefaultTranslations(
  'Load more',
  'View all',
  'Exact match on external id'
);

export default function SearchResultList({ query }: Props) {
  const {
    data: resourcesBySearch,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
  } = useInfiniteSearch<Asset>('assets', query, 20, undefined, {
    enabled: !!query,
  });

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

  /**
   * Translations
   */

  const t = {
    ...defaultTranslation,
    ...useTranslations(Object.keys(defaultTranslation), 'SearchResults').t,
  };

  if (isError) {
    return <Icon type="CloseLarge" />;
  }

  if (isLoading) {
    return <Icon type="Loader" />;
  }
  if (assets?.length === 0) {
    return null;
  }

  const exactMatchElement = assetExactMatch && (
    <li key={assetExactMatch.id}>
      <AssetSearchHit asset={assetExactMatch} query={query} isExact />
    </li>
  );

  const searchResultElements = assets?.map((asset) => (
    <li key={asset.id}>
      <AssetSearchHit asset={asset} query={query} />
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
