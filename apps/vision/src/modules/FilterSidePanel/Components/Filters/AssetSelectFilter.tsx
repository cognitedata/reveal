import React from 'react';

import { ByAssetFilter } from '@cognite/data-exploration';
import { InternalId } from '@cognite/sdk';

import { VisionFilterItemProps } from '../../types';

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
