import React from 'react';
import { ByAssetFilter } from '@cognite/data-exploration';
import { VisionFilterItemProps } from 'src/modules/FilterSidePanel/types';
import { InternalId } from '@cognite/sdk';

export const AssetSelectFilter = ({
  filter,
  setFilter,
}: VisionFilterItemProps) => (
  <ByAssetFilter
    value={filter.assetSubtreeIds?.map((el) => (el as InternalId).id)}
    setValue={(selectedItems) => {
      setFilter({
        ...filter,
        assetSubtreeIds: selectedItems?.map((id) => ({ id })),
      });
    }}
  />
);
