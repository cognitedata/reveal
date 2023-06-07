import EmptyResult, {
  defaultTranslations as emptyResultDefaultTranslations,
} from 'components/Search/EmptyResult';
import { SearchFilter } from 'components/Search/Search';
import { useTranslations } from 'hooks/translations';
import styled from 'styled-components/macro';
import { makeDefaultTranslations } from 'utils/translations';

import { Icon, Button } from '@cognite/cogs.js';

import AssetSearchHit from './AssetSearchHit';
import { useAssetSearchResults } from './hooks';
import RecentViewSources from './RecentViewSources';

type Props = {
  query: string;
  filter: SearchFilter;
  searchResults: ReturnType<typeof useAssetSearchResults>;
};

const defaultTranslations = makeDefaultTranslations(
  'Load more',
  'View all',
  'Exact match on external id'
);

export default function SearchResultList({
  query,
  filter,
  searchResults,
}: Props) {
  const {
    isLoading,
    resultExactMatch: assetExactMatch,
    results: assets,
    isError,
    fetchNextPage,
    hasNextPage,
    hasResults,
    isFetchingNextPage,
  } = searchResults;

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

  if (isLoading && query) {
    return <Icon type="Loader" />;
  }

  if (!hasResults) {
    return (
      <EmptyResult itemType="assets" translations={emptyResultTranslations} />
    );
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
        <>
          {isFetchingNextPage && <Icon type="Loader" />}
          <Button
            type="link"
            onClick={() => fetchNextPage()}
            style={{ marginBottom: '20px' }}
          >
            {t['Load more']}
          </Button>
        </>
      )}
    </AssetList>
  );
}

export const AssetList = styled.ul`
  height: 100%;
  list-style: none;
  padding: 0 10px 0 0;
  margin: 0;
`;
