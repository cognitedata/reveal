import React, { useMemo, useState } from 'react';
import { OptionType, Tooltip } from '@cognite/cogs.js';
import { InternalAssetData } from '@data-exploration-lib/domain-layer';
import { BaseMultiSelectFilterProps } from '../types';
import { MultiSelectFilter } from '../MultiSelectFilter';
import { useDebounce } from 'use-debounce';
import {
  useCdfItems,
  useList,
  useSearch,
} from '@cognite/sdk-react-query-hooks';
import { Asset } from '@cognite/sdk/dist/src';

interface BaseAssetSelectFilterProps<TFilter>
  extends BaseMultiSelectFilterProps<TFilter, number> {
  rootOnly?: boolean;
  selectedAssetIds?: number[] | undefined;
}

interface ByAssetFilterProps<TFilter>
  extends BaseAssetSelectFilterProps<TFilter> {
  options: OptionType<number>[];
  onInputChange?: (query: string) => void;
}

export const AssetSelectFilter = <TFilter,>({
  value,
  onChange,
  onInputChange,
  options,
  error,
  loading,
}: ByAssetFilterProps<TFilter>) => {
  const handleChange = (newValue: OptionType<number>[]) => {
    const newFilters = newValue && newValue.length > 0 ? newValue : undefined;
    onChange?.(newFilters as OptionType<number>[]);
  };

  const handleInputChange = (query: string) => {
    onInputChange?.(query);
  };

  if (loading) {
    return null;
  }

  return (
    <Tooltip interactive disabled={!error} content="Error fetching assets!">
      <MultiSelectFilter<number>
        label="Asset"
        isMulti
        isClearable
        value={value}
        isLoading={loading}
        options={options}
        onInputChange={handleInputChange}
        onChange={(_, selected) => {
          handleChange(selected);
        }}
      />
    </Tooltip>
  );
};

// TODO: This component will be refactored soon, now it just copies the legacy behavior.
// Task to update asset filter -> https://cognitedata.atlassian.net/browse/DEGR-1301
const CommonAssetSelectFilter = (
  props: BaseAssetSelectFilterProps<InternalAssetData>
) => {
  const { rootOnly, selectedAssetIds } = props;
  const [query, setQuery] = useState('');
  const [debouncedQuery] = useDebounce(query, 100);

  const {
    data: searchData,
    isLoading,
    isError,
  } = useSearch<Asset>(
    'assets',
    debouncedQuery,
    { limit: 50 },
    { enabled: debouncedQuery ? debouncedQuery.length > 0 : false }
  );
  const {
    data: rootSearchData,
    isLoading: isRootLoading,
    isError: isRootError,
  } = useSearch<Asset>(
    'assets',
    debouncedQuery,
    {
      limit: 50,
      filter: { root: true },
    },
    { enabled: debouncedQuery ? debouncedQuery.length > 0 : false }
  );

  const {
    data: listData,
    isLoading: isListLoading,
    isError: isListError,
  } = useList<Asset>('assets', {
    limit: 50,
  });
  const {
    data: rootListData,
    isLoading: isRootListLoading,
    isError: isRootListError,
  } = useList<Asset>('assets', {
    limit: 50,
    filter: { root: true },
  });

  const {
    data: selectedItems,
    isLoading: isAssetItemsLoading,
    isError: isAssetItemsError,
  } = useCdfItems<Asset>(
    'assets',
    selectedAssetIds ? selectedAssetIds.map((id) => ({ id })) : [],
    false,
    { keepPreviousData: true }
  );

  const [data, rootData] = useMemo(() => {
    if (debouncedQuery.length > 0) {
      return [searchData, rootSearchData];
    }
    return [listData, rootListData];
  }, [debouncedQuery, searchData, rootSearchData, listData, rootListData]);

  const values = rootOnly
    ? (rootData || []).map((el) => ({
        label: el.name,
        value: el.id,
      }))
    : [
        {
          label: 'Root assets',
          options: (rootData || []).map((el) => ({
            label: el.name,
            value: el.id,
          })),
        },
        {
          label: 'All assets',
          options: (data || []).map((el) => ({
            label: el.name,
            value: el.id,
          })),
        },
      ];

  const selectedItemValues = (selectedItems || []).map((el) => ({
    value: el.id,
    label: el.name,
  }));

  const isAssetsLoading =
    isAssetItemsLoading ||
    isLoading ||
    isRootLoading ||
    isListLoading ||
    isRootListLoading;

  const isAssetsError =
    isAssetItemsError ||
    isError ||
    isRootError ||
    isListError ||
    isRootListError;

  return (
    <AssetSelectFilter
      {...props}
      loading={isAssetsLoading}
      error={isAssetsError}
      options={values}
      value={selectedItemValues}
      onInputChange={setQuery}
    />
  );
};

AssetSelectFilter.Common = CommonAssetSelectFilter;
