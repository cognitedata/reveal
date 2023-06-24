import React, { useMemo, useState } from 'react';

import noop from 'lodash/noop';
import { useDebounce } from 'use-debounce';

import { Select } from '@cognite/data-exploration';
import { Asset } from '@cognite/sdk';
import {
  useCdfItems,
  useSearch,
  useList,
} from '@cognite/sdk-react-query-hooks';

import { useTranslation } from '@data-exploration-lib/core';

// import { Props, OptionTypeBase } from 'react-select';

type AssetInfo = { value: number; name: string };

export type AssetSelectProps = any & {
  onAssetSelected?: (assetIds?: number[]) => void;
  selectedAssetIds?: number[];
  rootOnly?: boolean;
};

export const AssetSelect = ({
  onAssetSelected = noop,
  selectedAssetIds,
  rootOnly,
  ...extraProps
}: AssetSelectProps) => {
  const { t } = useTranslation();

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
    selectedAssetIds ? selectedAssetIds.map((id: any) => ({ id })) : []
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
          label: t('ROOT_ASSETS', 'Root assets'),
          options: (rootData || []).map((el) => ({
            label: el.name,
            value: el.id,
          })),
        },
        {
          label: t('ALL_ASSETS', 'All assets'),
          options: (data || []).map((el) => ({ label: el.name, value: el.id })),
        },
      ];

  const getSelectedItemValues = () => {
    const selectedItemArr = selectedItems
      ? selectedItems.map((el) => ({
          value: el.id,
          label: el.name,
        }))
      : undefined;
    return selectedItemArr;
  };

  return (
    <Select
      isClearable
      styles={{
        container: (style: any) => ({
          ...style,
          width: '100%',
        }),
      }}
      {...extraProps}
      isLoading={isLoading || isRootLoading}
      value={getSelectedItemValues()}
      onInputChange={(input: any) => setQuery(input)}
      options={values}
      onChange={(selected: any) => {
        if (!selected) {
          onAssetSelected(undefined);
        } else if (selected.length !== undefined) {
          if (selected.length === 0) {
            onAssetSelected(undefined);
          } else {
            onAssetSelected(selected.map(({ value }: AssetInfo) => value));
          }
        } else {
          onAssetSelected(selected.map(({ value }: AssetInfo) => value));
        }
      }}
    />
  );
};
