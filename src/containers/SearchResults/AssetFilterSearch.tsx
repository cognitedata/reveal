import React, { useEffect, useContext } from 'react';
import { Body } from '@cognite/cogs.js';
import { SearchFilterSection, AssetTable } from 'components/Common';
import { AssetSearchFilter, AssetFilterProps } from 'cognite-sdk-v3';
import {
  useResourcesSelector,
  useResourcesDispatch,
} from '@cognite/cdf-resources-store';
import {
  searchSelector,
  search,
  count,
  countSelector,
  itemSelector,
  retrieve,
} from '@cognite/cdf-resources-store/dist/assets';
import ResourceSelectionContext from 'context/ResourceSelectionContext';
import { useResourcePreview } from 'context/ResourcePreviewContext';
import { List, Content } from './Common';

// const AssetsFilterMapping: { [key: string]: string } = {};

export const buildAssetsFilterQuery = (
  filter: AssetFilterProps,
  query: string | undefined
): AssetSearchFilter => {
  // const reverseLookup: { [key: string]: string } = Object.keys(
  //   AssetsFilterMapping
  // ).reduce((prev, key) => ({ ...prev, [AssetsFilterMapping[key]]: key }), {});
  return {
    ...(query &&
      query.length > 0 && {
        search: {
          query,
        },
      }),
    filter,
  };
};

export const AssetFilterSearch = ({ query = '' }: { query?: string }) => {
  const dispatch = useResourcesDispatch();
  const getAsset = useResourcesSelector(itemSelector);
  const { assetFilter, setAssetFilter } = useContext(ResourceSelectionContext);
  const { openPreview } = useResourcePreview();

  const { items: assets } = useResourcesSelector(searchSelector)(
    buildAssetsFilterQuery(assetFilter, query)
  );
  const { count: assetsCount } = useResourcesSelector(countSelector)(
    buildAssetsFilterQuery(assetFilter, query)
  );

  const rootIds = new Set<number>();
  assets.forEach(el => rootIds.add(el.rootId));
  const rootIdsNotLoaded = [...rootIds].sort().filter(id => !getAsset(id));

  useEffect(() => {
    dispatch(search(buildAssetsFilterQuery(assetFilter, query)));
    dispatch(count(buildAssetsFilterQuery(assetFilter, query)));
  }, [dispatch, assetFilter, query]);

  useEffect(() => {
    dispatch(retrieve(rootIdsNotLoaded.map(id => ({ id }))));
  }, [dispatch, rootIdsNotLoaded]);

  const metadataCategories: { [key: string]: string } = {};

  const tmpMetadata = assets.reduce((prev, el) => {
    if (!prev.source) {
      prev.source = new Set<string>();
    }
    if (el.source && el.source.length !== 0) {
      prev.source.add(el.source);
    }
    Object.keys(el.metadata || {}).forEach(key => {
      if (key === 'source') {
        return;
      }
      if (el.metadata![key].length !== 0) {
        if (!metadataCategories[key]) {
          metadataCategories[key] = 'Metadata';
        }
        if (!prev[key]) {
          prev[key] = new Set<string>();
        }
        prev[key].add(el.metadata![key]);
      }
    });
    return prev;
  }, {} as { [key: string]: Set<string> });

  const metadata = Object.keys(tmpMetadata).reduce((prev, key) => {
    prev[key] = [...tmpMetadata[key]];
    return prev;
  }, {} as { [key: string]: string[] });

  const filters: { [key: string]: string } = {
    ...(assetFilter.source && { source: assetFilter.source }),
    ...assetFilter.metadata,
  };

  return (
    <>
      <SearchFilterSection
        metadata={metadata}
        filters={filters}
        metadataCategory={metadataCategories}
        setFilters={newFilters => {
          const { source: newSource, ...newMetadata } = newFilters;
          setAssetFilter({ source: newSource, metadata: newMetadata });
        }}
      />
      <Content>
        <List>
          <Body>
            {query && query.length > 0
              ? `${
                  assetsCount === undefined ? 'Loading' : assetsCount
                } results for "${query}"`
              : `All ${assetsCount === undefined ? '' : assetsCount} Results`}
          </Body>
          <AssetTable
            assets={assets}
            onAssetClicked={asset =>
              openPreview({ item: { id: asset.id, type: 'asset' } })
            }
            query={query}
          />
        </List>
      </Content>
    </>
  );
};
