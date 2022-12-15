import React from 'react';
import { AssetSelect } from 'containers/Assets';
import { FilterFacetTitle } from '../FilterFacetTitle';
import { useMetrics } from 'hooks/useMetrics';
import { DATA_EXPLORATION_COMPONENT } from 'constants/metrics';

export const ByAssetFilterV2 = ({
  value,
  setValue,
  title = 'Asset',
}: {
  value: number[] | undefined;
  setValue: (newValue?: { label?: string; value: number }[]) => void;
  title?: string;
}) => {
  const trackUsage = useMetrics();

  const setFilterByAsset = (newValue?: { label?: string; value: number }[]) => {
    setValue(newValue);
    trackUsage(DATA_EXPLORATION_COMPONENT.SELECT.ASSET_FILTER, {
      ...newValue,
      title,
    });
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
