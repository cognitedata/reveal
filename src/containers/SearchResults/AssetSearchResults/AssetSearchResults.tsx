import React, { useState, useEffect } from 'react';
import { SegmentedControl } from '@cognite/cogs.js';
import { AssetFilterProps, Asset } from '@cognite/sdk';
import { EnsureNonEmptyResource } from 'components';
import {
  AssetTable,
  AssetTreeTable,
  SearchResultToolbar,
  SearchResultLoader,
} from 'containers';
import { SelectableItemsProps, DateRangeProps, TableStateProps } from 'types';
import { KeepMounted } from '../../../components/KeepMounted/KeepMounted';

export const AssetSearchResults = ({
  query = '',
  filter,
  showCount = false,
  onClick,
  ...extraProps
}: {
  query?: string;
  showCount?: boolean;
  filter: AssetFilterProps;
  onClick: (item: Asset) => void;
} & SelectableItemsProps &
  TableStateProps &
  DateRangeProps) => {
  const [currentView, setCurrentView] = useState<string>('tree');

  useEffect(() => {
    if (query.length > 0) {
      setCurrentView('list');
    }
  }, [query]);

  return (
    <>
      <SearchResultToolbar
        showCount={showCount}
        api={query.length > 0 ? 'search' : 'list'}
        type="asset"
        filter={filter}
        query={query}
      >
        <SegmentedControl
          currentKey={currentView}
          onButtonClicked={setCurrentView}
        >
          <SegmentedControl.Button
            icon="Tree"
            key="tree"
            title="Asset hierarchy"
            aria-label="Asset hierarchy"
          />
          <SegmentedControl.Button
            icon="List"
            key="list"
            title="List"
            aria-label="List"
          />
        </SegmentedControl>
      </SearchResultToolbar>
      <EnsureNonEmptyResource api="asset">
        <KeepMounted isVisible={currentView === 'list'}>
          <SearchResultLoader<Asset>
            type="asset"
            filter={filter}
            query={query}
            {...extraProps}
          >
            {props => (
              <AssetTable onRowClick={asset => onClick(asset)} {...props} />
            )}
          </SearchResultLoader>
        </KeepMounted>

        <KeepMounted isVisible={currentView !== 'list'}>
          <AssetTreeTable
            filter={filter}
            query={query}
            onAssetClicked={asset => onClick(asset)}
            {...extraProps}
          />
        </KeepMounted>
      </EnsureNonEmptyResource>
    </>
  );
};
