import React, { useContext, useState, useMemo } from 'react';
import {
  AssetTreeTable,
  SpacedRow,
  ResourceTable,
  ButtonGroup,
} from 'components/Common';
import { AssetSearchFilter, AssetFilterProps, Asset } from '@cognite/sdk';
import ResourceSelectionContext from 'context/ResourceSelectionContext';
import { useResourcePreview } from 'context/ResourcePreviewContext';
import { Button } from '@cognite/cogs.js';

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
        <ResourceTable<Asset>
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
      <SpacedRow>
        <ButtonGroup currentKey={currentView} onButtonClicked={setCurrentView}>
          <Button icon="Tree" key="tree">
            Tree View
          </Button>
          <Button icon="List" key="list">
            List View
          </Button>
        </ButtonGroup>
      </SpacedRow>
      {content}
    </>
  );
};
