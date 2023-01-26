import React, { useMemo, useState } from 'react';
import { Asset } from '@cognite/sdk';
import {
  useCdfItems,
  useSearch,
  useList,
} from '@cognite/sdk-react-query-hooks';
import { useDebounce } from 'use-debounce';
import { Props, OptionTypeBase } from 'react-select';
import { Theme } from '@cognite/cogs.js';
import { OptionValue } from '@data-exploration-components/components/SearchNew/Filters/types';
import noop from 'lodash/noop';
import { MultiSelectFilter } from '@data-exploration-components/components';

export type AssetSelectProps = Omit<Props<OptionTypeBase>, 'theme'> & {
  title: string;
  onAssetSelected?: (input?: OptionValue<number>[]) => void;
  selectedAssetIds?: number[];
  rootOnly?: boolean;
  cogsTheme?: Theme;
};

export const AssetSelect = ({
  title,
  onAssetSelected = noop,
  selectedAssetIds,
  rootOnly,
  cogsTheme,
  ...extraProps
}: AssetSelectProps) => {
  const [query, setQuery] = useState('');
  const [debouncedQuery] = useDebounce(query, 100);

  const { data: searchData, isLoading } = useSearch<Asset>(
    'assets',
    debouncedQuery,
    { limit: 50 },
    { enabled: debouncedQuery ? debouncedQuery.length > 0 : false }
  );
  const { data: rootSearchData, isLoading: isRootLoading } = useSearch<Asset>(
    'assets',
    debouncedQuery,
    {
      limit: 50,
      filter: { root: true },
    },
    { enabled: debouncedQuery ? debouncedQuery.length > 0 : false }
  );
  const { data: listData } = useList<Asset>('assets', {
    limit: 50,
  });
  const { data: rootListData } = useList<Asset>('assets', {
    limit: 50,
    filter: { root: true },
  });
  const { data: selectedItems } = useCdfItems<Asset>(
    'assets',
    selectedAssetIds ? selectedAssetIds.map((id) => ({ id })) : []
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
          options: (data || []).map((el) => ({ label: el.name, value: el.id })),
        },
      ];

  const selectedItemValues = (selectedItems || []).map((el) => ({
    value: el.id,
    label: el.name,
  }));

  return (
    <MultiSelectFilter
      title={title}
      isClearable
      {...extraProps}
      isLoading={isLoading || isRootLoading}
      value={selectedItemValues}
      onInputChange={setQuery}
      options={values}
      onChange={(_, selected) => {
        onAssetSelected(selected);
      }}
    />
  );
};
