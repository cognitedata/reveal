import React from 'react';
import { AssetSelect } from '@cognite/data-exploration';
import { FilterItemProps } from './filterItemProps';

export const AssetSelectFilter = ({ filter, setFilter }: FilterItemProps) => (
  <AssetSelect
    isMulti
    selectedAssetIds={filter.assetIds}
    onAssetSelected={(selectedItems) => {
      setFilter({
        ...filter,
        assetIds: selectedItems,
      });
    }}
  />
);
