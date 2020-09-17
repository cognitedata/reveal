import React, { useState } from 'react';
import { Asset } from 'cognite-sdk-v3';
import Table, { Column } from 'react-base-table';
import { Body, Button } from '@cognite/cogs.js';
import AutoSizer from 'react-virtualized-auto-sizer';
import { useResourcesSelector } from '@cognite/cdf-resources-store';
import { itemSelector } from '@cognite/cdf-resources-store/dist/assets';
import { useSelectionCheckbox } from 'hooks/useSelection';
import {
  useResourceMode,
  useResourcesState,
} from 'context/ResourceSelectionContext';
import Highlighter from 'react-highlight-words';
import { TableWrapper } from 'components/Common';

const headerRenderer = ({
  column: { title },
}: {
  column: { title: string };
}) => (
  <Body level={3} strong>
    {title}
  </Body>
);

const ActionCell = ({ asset }: { asset: Asset }) => {
  const getButton = useSelectionCheckbox();
  return getButton({ id: asset.id, type: 'asset' });
};
const ParentCell = ({
  asset,
  onAssetSelected,
}: {
  asset: Asset;
  onAssetSelected: (asset: Asset) => void;
}) => {
  const getAsset = useResourcesSelector(itemSelector);
  const rootAsset = getAsset(asset.rootId);
  return (
    <Button
      type="link"
      icon="ArrowRight"
      iconPlacement="right"
      style={{ color: 'inherit' }}
      onClick={e => {
        e.stopPropagation();
        if (rootAsset) {
          onAssetSelected(rootAsset);
        }
      }}
    >
      {rootAsset ? rootAsset.name : 'Loading...'}
    </Button>
  );
};
const HighlightCell = ({ text, query }: { text?: string; query?: string }) => {
  return (
    <Body level={2} strong>
      <Highlighter
        searchWords={(query || '').split(' ')}
        textToHighlight={text || ''}
      />
    </Body>
  );
};

export const AssetTable = ({
  assets,
  query,
  onAssetClicked,
}: {
  assets: Asset[];
  query?: string;
  onAssetClicked: (asset: Asset) => void;
}) => {
  const [previewId, setPreviewId] = useState<number | undefined>(undefined);
  const mode = useResourceMode();
  const resourcesState = useResourcesState();

  const currentItems = resourcesState.filter(el => el.state === 'active');

  const onAssetSelected = (asset: Asset) => {
    onAssetClicked(asset);
    setPreviewId(asset.id);
  };

  return (
    <TableWrapper>
      <AutoSizer>
        {({ width, height }) => (
          <Table
            rowEventHandlers={{
              onClick: ({ rowData: asset, event }) => {
                onAssetSelected(asset);
                return event;
              },
            }}
            rowClassName={({ rowData }) => {
              const extraClasses: string[] = [];
              if (previewId === rowData.id) {
                extraClasses.push('previewing');
              }
              if (currentItems.some(el => el.id === rowData.id)) {
                extraClasses.push('active');
              }
              return `row clickable ${extraClasses.join(' ')}`;
            }}
            width={width}
            height={height}
            columns={[
              {
                key: 'name',
                title: 'Name',
                dataKey: 'name',
                headerRenderer,
                width: 300,
                resizable: true,
                cellProps: { query },
                cellRenderer: ({ cellData: name }: { cellData: string }) => (
                  <HighlightCell text={name} query={query} />
                ),
                frozen: Column.FrozenDirection.LEFT,
              },
              {
                key: 'description',
                title: 'Description',
                dataKey: 'description',
                width: 300,
                headerRenderer,
                cellProps: { query },
                cellRenderer: ({
                  cellData: description,
                }: {
                  cellData?: string;
                }) => <HighlightCell text={description} query={query} />,
                resizable: true,
              },
              {
                key: 'root',
                title: 'Root Asset',
                width: 200,
                resizable: true,
                headerRenderer,
                cellRenderer: ({ rowData: asset }: { rowData: Asset }) => {
                  return (
                    <ParentCell
                      asset={asset}
                      onAssetSelected={onAssetSelected}
                    />
                  );
                },
              },
              {
                key: 'labels',
                title: 'Labels',
                width: 200,
                resizable: true,
                headerRenderer,
                cellRenderer: () => <Body level={3}>Coming soon....</Body>,
              },
              {
                key: 'templates',
                title: 'Templates',
                width: 200,
                resizable: true,
                headerRenderer,
                cellRenderer: () => {
                  return <Body level={3}>Coming soon....</Body>;
                },
              },
              ...(mode !== 'none'
                ? [
                    {
                      key: 'action',
                      title: 'Select',
                      width: 80,
                      resizable: true,
                      align: Column.Alignment.CENTER,
                      frozen: Column.FrozenDirection.RIGHT,
                      headerRenderer,
                      cellRenderer: ({
                        rowData: asset,
                      }: {
                        rowData: Asset;
                      }) => {
                        return <ActionCell asset={asset} />;
                      },
                    },
                  ]
                : []),
            ]}
            fixed
            data={assets}
          />
        )}
      </AutoSizer>
    </TableWrapper>
  );
};
