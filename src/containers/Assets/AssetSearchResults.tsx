import React, { useEffect, useContext } from 'react';
import { AssetTable } from 'components/Common';
import { AssetSearchFilter, AssetFilterProps } from 'cognite-sdk-v3';
import {
  useResourcesSelector,
  useResourcesDispatch,
} from '@cognite/cdf-resources-store';
import {
  searchSelector,
  search,
  itemSelector,
  retrieve,
} from '@cognite/cdf-resources-store/dist/assets';
import ResourceSelectionContext from 'context/ResourceSelectionContext';
import { useResourcePreview } from 'context/ResourcePreviewContext';

export const buildAssetsFilterQuery = (
  filter: AssetFilterProps,
  query: string | undefined
): AssetSearchFilter => {
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

export const AssetSearchResults = ({ query = '' }: { query?: string }) => {
  const dispatch = useResourcesDispatch();
  const getAsset = useResourcesSelector(itemSelector);
  const { assetFilter } = useContext(ResourceSelectionContext);
  const { openPreview } = useResourcePreview();

  const { items: assets } = useResourcesSelector(searchSelector)(
    buildAssetsFilterQuery(assetFilter, query)
  );

  const rootIds = new Set<number>();
  assets.forEach(el => rootIds.add(el.rootId));
  const rootIdsNotLoaded = [...rootIds].sort().filter(id => !getAsset(id));

  useEffect(() => {
    dispatch(search(buildAssetsFilterQuery(assetFilter, query)));
  }, [dispatch, assetFilter, query]);

  useEffect(() => {
    dispatch(retrieve(rootIdsNotLoaded.map(id => ({ id }))));
  }, [dispatch, rootIdsNotLoaded]);
  return (
    <AssetTable
      assets={assets}
      onAssetClicked={asset =>
        openPreview({ item: { id: asset.id, type: 'asset' } })
      }
      query={query}
    />
  );
};
