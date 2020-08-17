import React, { useEffect } from 'react';
import { Asset } from '@cognite/sdk';
import Table, { Column } from 'react-base-table';
import styled from 'styled-components';
import { Body, Button, Colors } from '@cognite/cogs.js';
import AutoSizer from 'react-virtualized-auto-sizer';
import TableStyle from 'react-base-table/styles.css';
import { useSelector } from 'react-redux';
import { itemSelector } from 'modules/assets';
import { useSelectionCheckbox } from 'hooks/useSelection';
import { useResourceMode } from 'context/ResourceSelectionContext';
import Highlighter from 'react-highlight-words';

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
  return getButton({ id: asset.id, type: 'assets' });
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
  const getAsset = useSelector(itemSelector);
  const mode = useResourceMode();
  useEffect(() => {
    TableStyle.use();
    return () => TableStyle.unuse();
  }, []);

  return (
    <Wrapper>
      <AutoSizer>
        {({ width, height }) => (
          <Table
            rowEventHandlers={{
              onClick: ({ rowData: asset }: { rowData: Asset }) =>
                onAssetClicked(asset),
            }}
            rowClassName={() => 'row clickable'}
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
                cellRenderer: ({ cellData: name }: { cellData: string }) => (
                  <Body level={2} strong>
                    <Highlighter
                      searchWords={(query || '').split(' ')}
                      textToHighlight={name}
                    />
                  </Body>
                ),
                frozen: Column.FrozenDirection.LEFT,
              },
              {
                key: 'description',
                title: 'Description',
                dataKey: 'description',
                width: 300,
                headerRenderer,
                cellRenderer: ({
                  cellData: description,
                }: {
                  cellData?: string;
                }) => (
                  <Body level={2}>
                    <Highlighter
                      searchWords={(query || '').split(' ')}
                      textToHighlight={description || ''}
                    />
                  </Body>
                ),
                resizable: true,
              },
              {
                key: 'root',
                title: 'Root Asset',
                width: 200,
                resizable: true,
                headerRenderer,
                cellRenderer: ({ rowData: asset }: { rowData: Asset }) => {
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
                          onAssetClicked(rootAsset);
                        }
                      }}
                    >
                      {rootAsset ? rootAsset.name : 'Loading...'}
                    </Button>
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
    </Wrapper>
  );
};

const Wrapper = styled.div`
  width: 100%;
  height: 100%;
  overflow-x: auto;
  overflow-y: hidden;
  .row {
    transition: 0.3s all;
    border-bottom: 1px solid ${Colors['greyscale-grey3'].hex()};
  }
  .BaseTable__header-cell {
    background: ${Colors['greyscale-grey2'].hex()};
  }
  .BaseTable__header-row {
    border-bottom: 1px solid ${Colors['greyscale-grey3'].hex()};
  }
  .row:hover,
  .BaseTable__row--hovered {
    background: ${Colors['greyscale-grey1'].hex()};
  }
  .clickable {
    cursor: pointer;
  }
`;
