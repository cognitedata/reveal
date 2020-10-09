import React, { useContext } from 'react';
import { ResourceTable } from 'components/Common';
import { AssetSearchFilter, AssetFilterProps, Asset } from '@cognite/sdk';
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
    <ResourceTable<Asset>
      api="assets"
      filter={assetFilter}
      query={query}
      onRowClick={asset =>
        openPreview({ item: { id: asset.id, type: 'asset' } })
      }
    />
  );
};
