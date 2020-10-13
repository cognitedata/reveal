import React, { useMemo, useState } from 'react';
import { Asset } from '@cognite/sdk';
import { useCdfItems, useSearch, useList } from 'hooks/sdk';
import { useDebounce } from 'use-debounce/lib';
import { Select } from 'components/Common';

import { Props, OptionTypeBase } from 'react-select';

export type AssetSelectProps = Props<OptionTypeBase> & {
  onAssetSelected?: (assets?: Asset[]) => void;
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
    {
      limit: 50,
    }
  );
  const { data: rootSearchData, isLoading: isRootLoading } = useSearch<Asset>(
    'assets',
    debouncedQuery,
    { limit: 50, filter: { root: true } }
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
      // eslint-disable-next-line react/jsx-props-no-spreading
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
            onAssetSelected(
              selected.map(
                (el: { value: number }) =>
                  (data || [])
                    .concat(rootData || [])
                    .find(item => item.id === el.value)!
              )
            );
          }
        } else {
          onAssetSelected([
            (data || [])
              .concat(rootData || [])
              .find(el => el.id === (selected as { value: number }).value)!,
          ]);
        }
      }}
    />
  );
};
