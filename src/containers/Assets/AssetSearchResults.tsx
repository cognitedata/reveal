import React, { useContext } from 'react';
import { AssetTable } from 'components/Common';
import { AssetSearchFilter, AssetFilterProps } from '@cognite/sdk';
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
  const { assetFilter } = useContext(ResourceSelectionContext);
  const { openPreview } = useResourcePreview();

  return (
    <AssetTable
      filter={assetFilter}
      query={query}
      onAssetClicked={asset =>
        openPreview({ item: { id: asset.id, type: 'asset' } })
      }
    />
  );
};
