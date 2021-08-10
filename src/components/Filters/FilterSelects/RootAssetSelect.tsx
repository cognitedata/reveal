import React, { useState } from 'react';
import { useSearch, useList } from '@cognite/sdk-react-query-hooks';
import { Asset } from '@cognite/sdk';
import { OptionType } from '@cognite/cogs.js';
import { Select } from 'components/Common';
import { useSelectFilter } from 'hooks';

type Props = {
  selectedRootAssets?: number[];
  onRootAssetSelected: (ids: number[]) => void;
};
export const RootAssetSelect = (props: Props): JSX.Element => {
  const { selectedRootAssets, onRootAssetSelected } = props;
  const [query, setQuery] = useState<string | undefined>();

  const { data: rootAssetsWithQuery } = useSearch(
    'assets',
    query!,
    {
      filter: { root: true },
      limit: 100,
    },
    { enabled: !!query }
  );
  const { data: allRootAssets } = useList<any>(
    'assets',
    {
      filter: { root: true },
      limit: 100,
    },
    { enabled: !query }
  );

  const options = (rootAssetsWithQuery ?? allRootAssets ?? []).map(
    (rootAsset: Asset): OptionType<React.ReactText> => ({
      label: rootAsset?.name,
      value: rootAsset?.id,
    })
  );

  const areRootAssetsLoaded = query
    ? Boolean(rootAssetsWithQuery)
    : Boolean(allRootAssets);
  const { currentSelection, setSingleSelection } = useSelectFilter<number>(
    areRootAssetsLoaded,
    options,
    selectedRootAssets,
    onRootAssetSelected,
    setQuery
  );

  const onRootAssetSearch = (rootAssetName: string) => {
    if (!rootAssetName?.length) setQuery(undefined);
    else setQuery(rootAssetName);
  };

  return (
    <Select
      tooltipProps={{
        hasPermission: true,
        isLoaded: Boolean(allRootAssets),
        tooltipContent: '',
      }}
      selectProps={{
        title: 'Root assets',
        backspaceRemovesValue: true,
        escapeClearsValue: true,
        isClearable: true,
        options,
        value: currentSelection,
        onInputChange: onRootAssetSearch,
        onChange: setSingleSelection,
      }}
    />
  );
};
