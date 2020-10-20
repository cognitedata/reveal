import React, { useMemo } from 'react';
import {
  Icon,
  Colors,
  Button,
  Dropdown,
  Menu,
  Overline,
} from '@cognite/cogs.js';
import { ListItem, SpacedRow } from 'lib/components';
import copy from 'copy-to-clipboard';
import { useTenant, useEnv } from 'lib/hooks/CustomHooks';
import { ResourceItem, ResourceType } from 'lib/types';
import { useCdfItems } from 'lib/hooks/sdk';
import { FileInfo, Asset, Timeseries } from '@cognite/sdk';
import {
  useCollections,
  Collection,
  useUpdateCollections,
} from 'lib/hooks/CollectionsHooks';

export const ShoppingCartPreview = ({
  cart,
  setCart,
}: {
  cart: ResourceItem[];
  setCart: (cart: ResourceItem[]) => void;
}) => {
  const fileIds = cart
    .filter(el => el.type === 'file')
    .map(({ id }) => ({ id }));
  const { data: files = [] } = useCdfItems<FileInfo>('files', fileIds);

  const assetIds = cart
    .filter(el => el.type === 'asset')
    .map(({ id }) => ({ id }));
  const { data: assets = [] } = useCdfItems<Asset>('assets', assetIds);

  const timeseriesIds = cart
    .filter(el => el.type === 'timeSeries')
    .map(({ id }) => ({ id }));
  const { data: timeseries = [] } = useCdfItems<Timeseries>(
    'timeseries',
    timeseriesIds
  );

  const tenant = useTenant();
  const env = useEnv();

  const { data: collections } = useCollections();
  const [updateCollections] = useUpdateCollections();

  const [assetCollections, tsCollections, fileCollections] = useMemo(() => {
    return (collections || []).reduce(
      (prev, el) => {
        switch (el.type) {
          case 'asset':
            prev[0].push(el);
            break;
          case 'timeSeries':
            prev[1].push(el);
            break;
          case 'file':
            prev[2].push(el);
            break;
        }
        return prev;
      },
      [[], [], []] as Collection[][]
    );
  }, [collections]);

  const onDeleteClicked = (item: { id: number }) => {
    setCart(cart.filter(el => el.id !== item.id));
  };

  const renderDeleteItemButton = (item: { id: number }) => (
    <Icon
      style={{
        alignSelf: 'center',
        color: Colors.danger.hex(),
      }}
      type="Delete"
      onClick={() => onDeleteClicked(item)}
    />
  );

  const generateButton = (type: ResourceType) => {
    let renderedCollections = assetCollections;
    let currentItems: { id: number }[] = assets;
    if (type === 'file') {
      renderedCollections = fileCollections;
      currentItems = files;
    }
    if (type === 'timeSeries') {
      renderedCollections = tsCollections;
      currentItems = timeseries;
    }
    return (
      <Dropdown
        content={
          <Menu>
            <Menu.Header>
              <Overline level={2}>COLLECTIONS</Overline>
              {renderedCollections.map(el => (
                <Menu.Item
                  onClick={() =>
                    updateCollections([
                      {
                        id: el.id,
                        update: {
                          operationBody: {
                            items: el.operationBody.items.concat(
                              currentItems
                                .filter(
                                  asset =>
                                    !el.operationBody.items.some(
                                      (item: any) => item.id === asset.id
                                    )
                                )
                                .map(({ id }) => ({ id }))
                            ),
                          },
                        },
                      },
                    ])
                  }
                >
                  {el.name}
                </Menu.Item>
              ))}
            </Menu.Header>
          </Menu>
        }
      >
        <Button size="small" variant="ghost">
          Add to
        </Button>
      </Dropdown>
    );
  };

  return (
    <div style={{ width: 300, position: 'relative' }}>
      <div style={{ height: '400px', overflowY: 'auto' }}>
        <SpacedRow>
          <Overline level={2} style={{ marginBottom: 8 }}>
            Asset
          </Overline>
          <div className="spacer" />
          {generateButton('asset')}
        </SpacedRow>
        {assets.map(asset => (
          <ListItem
            key={asset.id}
            bordered
            title={
              <div style={{ display: 'inline-flex', alignItems: 'center' }}>
                <Icon
                  style={{
                    alignSelf: 'center',
                    marginRight: '4px',
                  }}
                  type="DataStudio"
                />
                <span>{asset ? asset.name : 'Loading'}</span>
              </div>
            }
          >
            {renderDeleteItemButton(asset)}
          </ListItem>
        ))}
        <SpacedRow>
          <Overline level={2} style={{ marginBottom: 8 }}>
            Time series
          </Overline>
          <div className="spacer" />
          {generateButton('timeSeries')}
        </SpacedRow>
        {timeseries.map(ts => (
          <ListItem
            key={ts.id}
            bordered
            title={
              <div style={{ display: 'inline-flex', alignItems: 'center' }}>
                <Icon
                  style={{
                    alignSelf: 'center',
                    marginRight: '4px',
                  }}
                  type="DataStudio"
                />
                <span>{ts ? ts.name : 'Loading...'}</span>
              </div>
            }
          >
            {renderDeleteItemButton(ts)}
          </ListItem>
        ))}
        <SpacedRow>
          <Overline level={2} style={{ marginBottom: 8 }}>
            Files
          </Overline>
          <div className="spacer" />
          {generateButton('file')}
        </SpacedRow>
        {files.map(file => (
          <ListItem
            key={file.id}
            bordered
            title={
              <div style={{ display: 'inline-flex', alignItems: 'center' }}>
                <Icon
                  style={{
                    alignSelf: 'center',
                    marginRight: '4px',
                  }}
                  type="DataStudio"
                />
                <span>{file ? file.name : 'Loading...'}</span>
              </div>
            }
          >
            {renderDeleteItemButton(file)}
          </ListItem>
        ))}
      </div>
      <div style={{ width: '100%', display: 'flex', alignItems: 'center' }}>
        <Button
          style={{ flex: 1 }}
          type="primary"
          onClick={() => {
            const dataStr = `data:text/json;charset=utf-8,${encodeURIComponent(
              JSON.stringify(cart)
            )}`;
            const dlAnchorElem = document.createElement('a');
            dlAnchorElem.setAttribute('href', dataStr);
            dlAnchorElem.setAttribute('download', 'resources.json');
            dlAnchorElem.click();
          }}
        >
          Download JSON
        </Button>
        <Dropdown
          content={
            <Menu>
              <Menu.Item
                onClick={() => {
                  const urls = [];
                  if (assets.length > 0) {
                    urls.push(
                      `Assets?$filter=${assets
                        .map(item => `(Id eq ${item.id})`)
                        .join(' or ')}`
                    );
                  }
                  if (timeseries.length > 0) {
                    urls.push(
                      `Timeseries?$filter=${timeseries
                        .map(item => `(Id eq ${item.id})`)
                        .join(' or ')}`
                    );
                  }
                  if (files.length > 0) {
                    urls.push(
                      `Files?$filter=${files
                        .map(item => `(Id eq ${item.id})`)
                        .join(' or ')}`
                    );
                  }
                  copy(
                    JSON.stringify(
                      urls.map(
                        el =>
                          `https://${
                            env || 'api'
                          }.cognitedata.com/odata/v1/projects/${tenant}/${el}`
                      )
                    )
                  );
                }}
              >
                <Icon type="Copy" />
                Copy OData Queries
              </Menu.Item>
            </Menu>
          }
        >
          <Button variant="ghost" icon="VerticalEllipsis" />
        </Dropdown>
      </div>
    </div>
  );
};

// https://api.cognitedata.com/odata/v1/projects/contextualization/Assets?$filter=(Id eq 51865490571) or (Id eq 52579923080)
