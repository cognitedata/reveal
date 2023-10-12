import React from 'react';

import { AssetSelect } from '../../../../containers';

export const ByAssetFilter = ({
  value,
  setValue,
  title = 'Asset',
}: {
  value: number[] | undefined;
  setValue: (newValue: number[] | undefined) => void;
  title?: string;
}) => {
  const setFilterByAsset = (assetIds?: number[]) => {
    setValue(assetIds);
  };

  return (
    <AssetSelect
      title={title}
      isMulti
      selectedAssetIds={value}
      onAssetSelected={(input) =>
        setFilterByAsset(input?.map(({ value }) => value))
      }
    />
  );
};
