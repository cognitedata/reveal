import React from 'react';

import { AssetTable } from '@data-exploration/containers';
import {
  ResourceItem,
  convertResourceType,
  SelectableItemsProps,
} from '@data-exploration-components/types';

import { Asset } from '@cognite/sdk';
import { useCdfItem, useCdfItems } from '@cognite/sdk-react-query-hooks';

export const AssetIdTable = ({
  resource,
  onItemClicked,
}: {
  resource: ResourceItem;
  onItemClicked: (id: number) => void;
} & SelectableItemsProps) => {
  const { data: item, isFetched: isItemFetched } = useCdfItem(
    convertResourceType(resource.type),
    { id: resource.id },
    { enabled: !!resource?.externalId }
  );

  const assetIds: number[] =
    (item as any).assetIds || [(item as any).assetId] || [];

  const { data: assets = [] } = useCdfItems<Asset>(
    'assets',
    assetIds.map((id) => ({ id })),
    false,
    { enabled: isItemFetched && !!assetIds && assetIds.length > 0 }
  );

  return (
    <AssetTable
      data={assets}
      onRowClick={(asset) => onItemClicked(asset.id)}
      id="asset-id-table"
    />
  );
};
