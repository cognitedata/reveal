import React, { useState, useMemo } from 'react';
import { Button } from '@cognite/cogs.js';
import { AssetSearchFilter, AssetFilterProps, Asset } from '@cognite/sdk';
import { ButtonGroup } from 'lib/components';
import { useResourcePreview } from 'lib/context';
import { SearchResultTable } from 'lib/components/Search/SearchPageTable';
import { AssetTreeTable } from 'lib/containers/Assets';
import { SearchResultToolbar } from 'lib/containers';
import { SelectableItemsProps } from 'lib/CommonProps';

export const buildAssetsFilterQuery = (
  filter: AssetFilterProps,
  query: string | undefined
): AssetSearchFilter => {
  return {
    ...(query &&
      query.length > 0 && {
        search: {
          query,
        },
      }),
    filter,
  };
};

export const AssetSearchResults = ({
  query = '',
  filter,
  ...selectionProps
}: { query?: string; filter: AssetFilterProps } & SelectableItemsProps) => {
  const { openPreview } = useResourcePreview();
  const [currentView, setCurrentView] = useState<string>('tree');

  const content = useMemo(() => {
    if (currentView === 'list') {
      return (
        <SearchResultTable<Asset>
          api="assets"
          filter={filter}
          query={query}
          onRowClick={asset =>
            openPreview({ item: { id: asset.id, type: 'asset' } })
          }
          {...selectionProps}
        />
      );
    }
    return (
      <AssetTreeTable
        filter={filter}
        startFromRoot={!filter.assetSubtreeIds}
        query={query}
        onAssetClicked={asset =>
          openPreview({ item: { id: asset.id, type: 'asset' } })
        }
        {...selectionProps}
      />
    );
  }, [currentView, filter, openPreview, query, selectionProps]);

  return (
    <>
      <SearchResultToolbar
        api={query.length > 0 ? 'search' : 'list'}
        type="assets"
        filter={filter}
        query={query}
      >
        <ButtonGroup currentKey={currentView} onButtonClicked={setCurrentView}>
          <Button icon="Tree" key="tree">
            Tree View
          </Button>
          <Button icon="List" key="list">
            List View
          </Button>
        </ButtonGroup>
      </SearchResultToolbar>
      {content}
    </>
  );
};
