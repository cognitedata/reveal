import React, { useMemo, useState } from 'react';
import { Asset } from '@cognite/sdk';
import {
  useCdfItems,
  useSearch,
  useList,
} from '@cognite/sdk-react-query-hooks';
import { useDebounce } from 'use-debounce/lib';
import { Select } from 'lib/components';
import { Props, OptionTypeBase } from 'react-select';

type AssetInfo = { value: number; name: string };

export type AssetSelectProps = Props<OptionTypeBase> & {
  onAssetSelected?: (assetIds?: number[]) => void;
  selectedAssetIds?: number[];
  rootOnly?: boolean;
};

export const AssetSelect = ({
  onAssetSelected = () => {},
  selectedAssetIds,
  rootOnly,
  ...extraProps
}: AssetSelectProps) => {
  const [query, setQuery] = useState('');
  const [debouncedQuery] = useDebounce(query, 100);

  const { data: searchData, isLoading } = useSearch<Asset>(
    'assets',
    debouncedQuery,
    { limit: 50 },
    { enabled: debouncedQuery && debouncedQuery.length > 0 }
  );
  const { data: rootSearchData, isLoading: isRootLoading } = useSearch<Asset>(
    'assets',
    debouncedQuery,
    {
      limit: 50,
      filter: { root: true },
    },
    { enabled: debouncedQuery && debouncedQuery.length > 0 }
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
    selectedAssetIds ? selectedAssetIds.map(id => ({ id })) : []
  );

  const [data, rootData] = useMemo(() => {
    if (debouncedQuery.length > 0) {
      return [searchData, rootSearchData];
    }
    return [listData, rootListData];
  }, [debouncedQuery, searchData, rootSearchData, listData, rootListData]);

  const values = rootOnly
    ? (rootData || []).map(el => ({
        label: el.name,
        value: el.id,
      }))
    : [
        {
          label: 'Root assets',
          options: (rootData || []).map(el => ({
            label: el.name,
            value: el.id,
          })),
        },
        {
          label: 'All assets',
          options: (data || []).map(el => ({ label: el.name, value: el.id })),
        },
      ];

  return (
    <Select
      isClearable
      styles={{
        container: style => ({
          ...style,
          width: '100%',
        }),
      }}
      {...extraProps}
      isLoading={isLoading || isRootLoading}
      value={
        selectedItems
          ? selectedItems.map(el => ({
              value: el.id,
              label: el.name,
            }))
          : undefined
      }
      onInputChange={input => setQuery(input)}
      options={values}
      onChange={selected => {
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
