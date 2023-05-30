import React, { useMemo, useState } from 'react';

import { useDebounce } from 'use-debounce';

import { OptionType, Tooltip } from '@cognite/cogs.js';
import { Asset } from '@cognite/sdk/dist/src';
import { useList, useSearch } from '@cognite/sdk-react-query-hooks';

import {
  useMetrics,
  DATA_EXPLORATION_COMPONENT,
} from '@data-exploration-lib/core';
import { InternalAssetData } from '@data-exploration-lib/domain-layer';

import { MultiSelectFilter } from '../MultiSelectFilter';
import { BaseMultiSelectFilterProps } from '../types';

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

const FILTER_LABEL = 'Asset';

export const AssetSelectFilter = <TFilter,>({
  value,
  onChange,
  onInputChange,
  options,
  isError,
  isLoading,
}: ByAssetFilterProps<TFilter>) => {
  const trackUsage = useMetrics();

  const handleChange = (
    newValue: {
      label: string;
      value: number;
    }[]
  ) => {
    const newFilters = newValue && newValue.length > 0 ? newValue : undefined;
    onChange?.(newFilters);
    trackUsage(DATA_EXPLORATION_COMPONENT.SELECT.ASSET_FILTER, {
      ...newValue,
      title: FILTER_LABEL,
    });
  };

  const handleInputChange = (query: string) => {
    onInputChange?.(query);
  };

  return (
    <Tooltip interactive disabled={!isError} content="Error fetching assets!">
      <MultiSelectFilter<number>
        label={FILTER_LABEL}
        isMulti
        isClearable
        value={value}
        isLoading={isLoading}
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
  const { rootOnly, value } = props;
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

  const [data, rootData] = useMemo(() => {
    if (debouncedQuery.length > 0) {
      return [searchData, rootSearchData];
    }
    return [listData, rootListData];
  }, [debouncedQuery, searchData, rootSearchData, listData, rootListData]);

  const options = rootOnly
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

  const isAssetsLoading =
    isLoading || isRootLoading || isListLoading || isRootListLoading;

  const isAssetsError =
    isError || isRootError || isListError || isRootListError;

  return (
    <AssetSelectFilter
      {...props}
      isLoading={isAssetsLoading}
      isError={isAssetsError}
      options={options}
      value={value}
      onInputChange={setQuery}
    />
  );
};

AssetSelectFilter.Common = CommonAssetSelectFilter;
