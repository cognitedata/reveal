import React from 'react';
import { AssetSelect } from 'containers/Assets';
import { FilterFacetTitle } from '../FilterFacetTitle';

export const ByAssetFilterV2 = ({
  value,
  setValue,
  title = 'Asset',
}: {
  value: number[] | undefined;
  setValue: (newValue?: { label?: string; value: number }[]) => void;
  title?: string;
}) => {
  const setFilterByAsset = (newValue?: { label?: string; value: number }[]) => {
    setValue(newValue);
  };

  return (
    <>
      <FilterFacetTitle>{title}</FilterFacetTitle>
      <AssetSelect
        isMulti
        selectedAssetIds={value}
        onAssetSelected={setFilterByAsset}
        cogsTheme="grey"
      />
    </>
  );
};
