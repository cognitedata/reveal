import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Select, Spin } from 'antd';
import { Asset, AssetSearchFilter } from '@cognite/sdk';
import { search, searchSelector as searchAssetSelector } from 'modules/assets';
import { Result } from 'modules/sdk-builder/types';

type Props = {
  style?: React.CSSProperties;
  onAssetSelected?: (asset?: Asset) => void;
  selectedAssetId?: number;
  rootOnly?: boolean;
  placeholder?: string;
  disabled?: boolean;
};

function getFilters(query: string = ''): AssetSearchFilter[] {
  const assetSearch: AssetSearchFilter = {
    limit: 100,
    search: query.length > 0 ? { query } : {},
  };
  const rootAssetSearch = {
    ...assetSearch,
    filter: {
      root: true,
    },
  };
  return [assetSearch, rootAssetSearch];
}

export default function AssetSelect(props: Props) {
  const [query, setQuery] = useState('');
  const dispatch = useDispatch();

  const { onAssetSelected = () => {}, selectedAssetId, rootOnly } = props;
  const [assetSearch, assetRootSearch] = getFilters(query);

  const getAsset: (q: AssetSearchFilter) => Result<Asset> = useSelector(
    searchAssetSelector
  );
  const { items, fetching } = getAsset(assetSearch);
  // @ts-ignore
  const { items: rootItems, fetching: rootFetching } = useSelector(
    searchAssetSelector
  )(assetRootSearch);

  useEffect(() => {
    const [f1, f2] = getFilters(query);
    if (!rootOnly) {
      dispatch(search({ filter: f1 }));
    }
    dispatch(search({ filter: f2 }));
  }, [dispatch, query, rootOnly]);

  return (
    <Select
      disabled={!!props.disabled}
      showSearch
      style={props.style || { width: '200px' }}
      placeholder={props.placeholder || 'Search for an asset'}
      value={selectedAssetId}
      notFoundContent={fetching || rootFetching ? <Spin size="small" /> : null}
      onSelect={(id: number | undefined) =>
        onAssetSelected([...rootItems, ...items].find((el) => el.id === id))
      }
      onChange={(id: number | undefined) => {
        if (!id) {
          onAssetSelected([...rootItems, ...items].find((el) => el.id === id));
        }
      }}
      onSearch={setQuery}
      filterOption={false}
      allowClear
    >
      {rootItems.length !== 0 && (
        <Select.OptGroup label="Root assets" key="root">
          {rootItems.map((asset: any) => (
            <Select.Option key={asset.id} value={asset.id}>
              <span>{asset.name}</span>
              <span style={{ color: '#ababab', marginLeft: '4px' }}>
                ({asset.id})
              </span>
            </Select.Option>
          ))}
        </Select.OptGroup>
      )}
      {items.length !== 0 && !rootOnly && (
        <Select.OptGroup label="All Assets" key="assets">
          {items.map((asset) => (
            <Select.Option key={asset.id} value={asset.id}>
              <span>{asset.name}</span>
              <span style={{ color: '#ababab', marginLeft: '4px' }}>
                ({asset.id})
              </span>
            </Select.Option>
          ))}
        </Select.OptGroup>
      )}
    </Select>
  );
}
