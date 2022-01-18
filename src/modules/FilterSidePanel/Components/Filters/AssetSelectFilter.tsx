import React from 'react';
import { AssetSelect } from '@cognite/data-exploration';
import { VisionFilterItemProps } from 'src/modules/FilterSidePanel/types';

export const AssetSelectFilter = ({
  filter,
  setFilter,
}: VisionFilterItemProps) => (
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
