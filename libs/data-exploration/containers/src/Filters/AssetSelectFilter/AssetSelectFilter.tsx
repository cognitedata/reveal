import { useMemo, useState } from 'react';

import isEmpty from 'lodash/isEmpty';
import { useDebounce } from 'use-debounce';

import { OptionType, Tooltip } from '@cognite/cogs.js';
import { Asset } from '@cognite/sdk/dist/src';
import { useList, useSearch } from '@cognite/sdk-react-query-hooks';

import {
  useMetrics,
  DATA_EXPLORATION_COMPONENT,
  useTranslation,
} from '@data-exploration-lib/core';
import {
  InternalAssetData,
  mapAssetsToAssetFilterOptions,
} from '@data-exploration-lib/domain-layer';

import { MultiSelectFilter } from '../MultiSelectFilter';
import {
  AssetFilterType,
  BaseMultiSelectFilterProps,
  MultiSelectFilterValue,
} from '../types';

import { AssetTypeSelector } from './AssetTypeSelector';
import { getAssetFilterTypeWithValue } from './utils';

interface BaseAssetSelectFilterProps<TFilter>
  extends BaseMultiSelectFilterProps<TFilter, number> {
  rootOnly?: boolean;
  selectedAssetIds?: number[] | undefined;
}

interface ByAssetFilterProps<TFilter>
  extends Omit<BaseAssetSelectFilterProps<TFilter>, 'value' | 'onChange'> {
  value?: Record<AssetFilterType, MultiSelectFilterValue<number> | undefined>;
  options: OptionType<number>[];
  onChange?: (
    newValue: MultiSelectFilterValue<number> | undefined,
    assetFilterType: AssetFilterType
  ) => void;
  onInputChange?: (query: string) => void;
}

export const AssetSelectFilter = <TFilter,>({
  value,
  onChange,
  onInputChange,
  options,
  isError,
  isLoading,
  ...rest
}: ByAssetFilterProps<TFilter>) => {
  const { t } = useTranslation();
  const trackUsage = useMetrics();

  const [assetFilterType, setAssetFilterType] = useState<AssetFilterType>(
    getAssetFilterTypeWithValue(value)
  );

  const handleChange = (newValue: MultiSelectFilterValue<number>) => {
    const newFilters = isEmpty(newValue) ? undefined : newValue;
    onChange?.(newFilters, assetFilterType);
    trackUsage(DATA_EXPLORATION_COMPONENT.SELECT.ASSET_FILTER, {
      ...newValue,
      title: 'Asset',
    });
  };

  const handleInputChange = (query: string) => {
    onInputChange?.(query);
  };

  return (
    <Tooltip
      interactive
      disabled={!isError}
      content={t('ERROR_FETCHING_DATA', 'Error fetching assets!', {
        type: 'assets',
      })}
    >
      <MultiSelectFilter<number>
        {...rest}
        isMulti
        isClearable
        label={t('ASSETS', 'Assets')}
        value={value?.[assetFilterType]}
        isLoading={isLoading}
        options={options}
        onInputChange={handleInputChange}
        onChange={(_, selected) => {
          handleChange(selected);
        }}
        renderHeader={() => (
          <AssetTypeSelector
            assetFilterType={assetFilterType}
            onChange={setAssetFilterType}
          />
        )}
      />
    </Tooltip>
  );
};

const LIMIT = 100;

const CommonAssetSelectFilter = (
  props: Omit<ByAssetFilterProps<InternalAssetData>, 'options'>
) => {
  const { rootOnly, value } = props;
  const [query, setQuery] = useState('');
  const [debouncedQuery] = useDebounce(query, 100);

  const {
    data: nonRootSearchData = [],
    isInitialLoading: isNonRootSearchLoading,
    isError: isNonRootSearchError,
  } = useSearch<Asset>(
    'assets',
    debouncedQuery,
    {
      limit: LIMIT,
      filter: { root: false },
    },
    { enabled: debouncedQuery ? debouncedQuery.length > 0 : false }
  );
  const {
    data: rootSearchData = [],
    isInitialLoading: isRootSearchLoading,
    isError: isRootSearchError,
  } = useSearch<Asset>(
    'assets',
    debouncedQuery,
    {
      limit: LIMIT,
      filter: { root: true },
    },
    { enabled: debouncedQuery ? debouncedQuery.length > 0 : false }
  );

  const {
    data: nonRootListData = [],
    isLoading: isNonRootListLoading,
    isError: isNonRootListError,
  } = useList<Asset>('assets', {
    limit: LIMIT,
    filter: { root: false },
  });
  const {
    data: rootListData = [],
    isLoading: isRootListLoading,
    isError: isRootListError,
  } = useList<Asset>('assets', {
    limit: LIMIT,
    filter: { root: true },
  });

  const [nonRootData, rootData] = useMemo(() => {
    if (debouncedQuery.length > 0) {
      return [nonRootSearchData, rootSearchData];
    }
    return [nonRootListData, rootListData];
  }, [
    debouncedQuery,
    nonRootSearchData,
    rootSearchData,
    nonRootListData,
    rootListData,
  ]);

  const options = useMemo(() => {
    if (rootOnly) {
      return mapAssetsToAssetFilterOptions(rootData);
    }
    return mapAssetsToAssetFilterOptions([...rootData, ...nonRootData]);
  }, [nonRootData, rootData, rootOnly]);

  const isAssetsLoading =
    isNonRootSearchLoading ||
    isRootSearchLoading ||
    isNonRootListLoading ||
    isRootListLoading;

  const isAssetsError =
    isNonRootSearchError ||
    isRootSearchError ||
    isNonRootListError ||
    isRootListError;

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
