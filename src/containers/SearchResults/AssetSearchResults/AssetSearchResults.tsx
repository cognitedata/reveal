import React, { useState, useMemo, useEffect } from 'react';
import { SegmentedControl } from '@cognite/cogs.js';
import { AssetFilterProps, Asset } from '@cognite/sdk';
import { EnsureNonEmptyResource } from 'components';
import {
  AssetTable,
  AssetTreeTable,
  SearchResultToolbar,
  SearchResultLoader,
} from 'containers';
import {
  SelectableItemsProps,
  DateRangeProps,
  TableStateProps,
} from 'CommonProps';

export const AssetSearchResults = ({
  query = '',
  filter,
  onClick,
  ...extraProps
}: {
  query?: string;
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

  const content = useMemo(() => {
    if (currentView === 'list') {
      return (
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
      );
    }
    return (
      <AssetTreeTable
        filter={filter}
        query={query}
        onAssetClicked={asset => onClick(asset)}
        {...extraProps}
      />
    );
  }, [currentView, filter, onClick, query, extraProps]);

  return (
    <>
      <SearchResultToolbar
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
      <EnsureNonEmptyResource api="asset">{content}</EnsureNonEmptyResource>
    </>
  );
};
