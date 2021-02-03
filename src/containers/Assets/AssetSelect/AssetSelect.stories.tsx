import React, { useState } from 'react';
import { action } from '@storybook/addon-actions';
import { Asset } from '@cognite/sdk';
import { AssetSelect } from './AssetSelect';

export default {
  title: 'Assets/Base/AssetSelect',
  component: AssetSelect,
};

export const Example = () => {
  const [selected, setSelected] = useState<Asset | undefined>(undefined);
  return (
    <AssetSelect
      selectedAssetIds={selected ? [selected?.id] : []}
      onAssetSelected={item => {
        setSelected(item ? item[0] : undefined);
        action('onAssetSelected')(item);
      }}
    />
  );
};
export const ExampleMulti = () => {
  const [selected, setSelected] = useState<Asset[]>([]);
  return (
    <AssetSelect
      isMulti
      selectedAssetIds={selected.map(el => el.id)}
      onAssetSelected={item => {
        setSelected(item || []);
        action('onAssetSelected')(item);
      }}
    />
  );
};
