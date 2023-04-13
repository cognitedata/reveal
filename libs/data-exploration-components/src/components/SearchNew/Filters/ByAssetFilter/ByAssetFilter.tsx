import React from 'react';
import { AssetSelect } from '@data-exploration-components/containers/Assets';
import {
  DATA_EXPLORATION_COMPONENT,
  useMetrics,
} from '@data-exploration-lib/core';

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
    <AssetSelect
      title={title}
      isMulti
      selectedAssetIds={value}
      onAssetSelected={setFilterByAsset}
      cogsTheme="grey"
    />
  );
};
