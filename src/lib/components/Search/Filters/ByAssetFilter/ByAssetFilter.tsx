import React from 'react';
import { Body } from '@cognite/cogs.js';
import { AssetSelect } from 'lib/containers/Assets';

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
    <>
      <Body
        level={4}
        style={{ marginBottom: 5, marginTop: 10 }}
        className="title"
      >
        {title}
      </Body>
      <AssetSelect
        isMulti
        selectedAssetIds={value}
        onAssetSelected={setFilterByAsset}
      />
    </>
  );
};
