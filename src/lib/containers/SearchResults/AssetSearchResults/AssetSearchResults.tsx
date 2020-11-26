import React, { useState, useMemo } from 'react';
import { Button } from '@cognite/cogs.js';
import { AssetFilterProps, Asset } from '@cognite/sdk';
import { ButtonGroup } from 'lib/components';
import { AssetTreeTable } from 'lib/containers/Assets';
import { AssetTable, SearchResultToolbar } from 'lib/containers';
import { SelectableItemsProps } from 'lib/CommonProps';
import { SearchResultLoader } from 'lib';

export const AssetSearchResults = ({
  query = '',
  filter,
  onClick,
  ...selectionProps
}: {
  query?: string;
  filter: AssetFilterProps;
  onClick: (item: Asset) => void;
} & SelectableItemsProps) => {
  const [currentView, setCurrentView] = useState<string>('tree');

  const content = useMemo(() => {
    if (currentView === 'list') {
      return (
        <SearchResultLoader<Asset>
          type="asset"
          filter={filter}
          query={query}
          {...selectionProps}
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
        startFromRoot={!filter.assetSubtreeIds}
        query={query}
        onAssetClicked={asset => onClick(asset)}
        {...selectionProps}
      />
    );
  }, [currentView, filter, onClick, query, selectionProps]);

  return (
    <>
      <SearchResultToolbar
        api={query.length > 0 ? 'search' : 'list'}
        type="asset"
        filter={filter}
        query={query}
      >
        <ButtonGroup currentKey={currentView} onButtonClicked={setCurrentView}>
          <Button icon="Tree" key="tree" />
          <Button icon="List" key="list" />
        </ButtonGroup>
      </SearchResultToolbar>
      {content}
    </>
  );
};
