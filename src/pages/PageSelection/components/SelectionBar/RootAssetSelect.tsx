import React, { useState, useEffect } from 'react';
import isEqual from 'lodash/isEqual';
import { Asset } from '@cognite/sdk';
import { Select } from '@cognite/cogs.js';
import { useSearch, useList } from '@cognite/sdk-react-query-hooks';
import { OptionsType } from './types';
import { selectStyles } from './utils';

type Props = {
  selectedRootAsset?: OptionsType;
  onRootAssetSelected: (rootAsset: OptionsType) => void;
};
export default function RootAssetsSelect(props: Props): JSX.Element {
  const { selectedRootAsset, onRootAssetSelected } = props;

  const [query, setQuery] = useState<string | undefined>();
  const [options, setOptions] = useState<OptionsType[]>([]);

  const { data: rootAssetsWithQuery = [] } = useSearch(
    'assets',
    query!,
    {
      filter: { root: true },
      limit: 100,
    },
    { enabled: !!query }
  );
  const { data: allRootAssets = [] } = useList(
    'assets',
    {
      filter: { root: true },
      limit: 100,
    },
    { enabled: !query }
  );

  useEffect(() => {
    const rootAssetsToMap = query ? rootAssetsWithQuery : allRootAssets;
    const newRootAssets = rootAssetsToMap?.map((rootAsset: Asset) => ({
      label: rootAsset.name,
      value: rootAsset.id,
    }));
    const shouldOptionsUpdate = !isEqual(newRootAssets, options);
    if (shouldOptionsUpdate) setOptions(newRootAssets);
  }, [query, rootAssetsWithQuery, allRootAssets, options]);

  const onRootAssetSearch = (value: string) => {
    if (!value?.length) setQuery(undefined);
    else setQuery(value);
  };
  const onRootAssetSelect = (option: OptionsType) => {
    onRootAssetSelected(option);
  };

  return (
    <div style={{ minWidth: '250px' }}>
      <Select
        title="Root assets"
        placeholder=""
        backspaceRemovesValue
        escapeClearsValue
        isClearable
        options={options}
        value={selectedRootAsset?.value}
        onInputChange={onRootAssetSearch}
        onChange={onRootAssetSelect}
        styles={selectStyles}
      />
    </div>
  );
}
