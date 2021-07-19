import React, { useMemo } from 'react';
import { Icon, Button, Title } from '@cognite/cogs.js';
import { Asset } from '@cognite/sdk';
import { useInfiniteSearch } from '@cognite/sdk-react-query-hooks';
import styled from 'styled-components/macro';

import AssetSearchHit from './AssetSearchHit';
import RecentlyViewed from './RecentlyViewed';

type Props = {
  query: string;
};
export default function SearchResultList({ query }: Props) {
  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
  } = useInfiniteSearch<Asset>('assets', query, 20, undefined, {
    enabled: !!query,
  });
  const assets = useMemo(
    () => data?.pages?.reduce((accl, page) => accl.concat(page), []),
    [data]
  );

  if (isError) {
    return <Icon type="XLarge" />;
  }

  if (isLoading) {
    return <Icon type="Loading" />;
  }
  if (assets?.length === 0) {
    return null;
  }

  return (
    <AssetList>
      <RecentlyViewed viewType="assets" />
      {assets?.map((asset) => (
        <li key={asset.id}>
          <AssetSearchHit asset={asset} query={query} />
        </li>
      ))}
      {hasNextPage && (
        <Button
          type="link"
          onClick={() => fetchNextPage()}
          style={{ marginBottom: '20px' }}
        >
          Load more
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
