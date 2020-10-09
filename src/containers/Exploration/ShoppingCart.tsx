import React from 'react';
import { Icon, Colors, Button, Title, Dropdown, Menu } from '@cognite/cogs.js';
import { ListItem } from 'components/Common';
import copy from 'copy-to-clipboard';
import { useTenant, useEnv } from 'hooks/CustomHooks';
import { ResourceItem } from 'types';
import { useCdfItems } from 'hooks/sdk';
import { FileInfo, Asset, Timeseries } from '@cognite/sdk';

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

  return (
    <div style={{ width: 300, position: 'relative' }}>
      <div style={{ height: '400px', overflowY: 'auto' }}>
        <Title level={5} style={{ marginBottom: 8 }}>
          Asset
        </Title>
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
        <Title level={5} style={{ marginBottom: 8 }}>
          Time series
        </Title>
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
        <Title level={5} style={{ marginBottom: 8 }}>
          Files
        </Title>
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
