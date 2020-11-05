import React, { useContext, useState, useMemo } from 'react';
import { Button } from '@cognite/cogs.js';
import { AssetSearchFilter, AssetFilterProps, Asset } from '@cognite/sdk';
import { ButtonGroup } from 'lib/components';
import { ResourceSelectionContext, useResourcePreview } from 'lib/context';
import { SearchResultTable } from 'lib/components/Search/SearchPageTable';
import { AssetTreeTable } from 'lib/containers/Assets';
import { SearchResultToolbar } from 'lib/containers';

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

export const AssetSearchResults = ({ query = '' }: { query?: string }) => {
  const { assetFilter } = useContext(ResourceSelectionContext);
  const { openPreview } = useResourcePreview();
  const [currentView, setCurrentView] = useState<string>('tree');

  const content = useMemo(() => {
    if (currentView === 'list') {
      return (
        <SearchResultTable<Asset>
          api="assets"
          filter={assetFilter}
          query={query}
          onRowClick={asset =>
            openPreview({ item: { id: asset.id, type: 'asset' } })
          }
        />
      );
    }
    return (
      <AssetTreeTable
        filter={assetFilter}
        startFromRoot={!assetFilter.assetSubtreeIds}
        query={query}
        onAssetClicked={asset =>
          openPreview({ item: { id: asset.id, type: 'asset' } })
        }
      />
    );
  }, [currentView, assetFilter, openPreview, query]);

  return (
    <>
      <SearchResultToolbar
        api={query.length > 0 ? 'search' : 'list'}
        type="assets"
        filter={assetFilter}
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
