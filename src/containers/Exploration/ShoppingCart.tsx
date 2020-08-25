import React, { useEffect } from 'react';
import { Icon, Colors, Button, Title, Dropdown, Menu } from '@cognite/cogs.js';
import { ListItem } from 'components/Common';
import {
  itemSelector as fileSelector,
  retrieve as retrieveFiles,
} from 'modules/files';
import {
  itemSelector as timeseriesSelector,
  retrieve as retrieveTimeseries,
} from 'modules/timeseries';
import {
  itemSelector as assetsSelector,
  retrieve as retrieveAssets,
} from 'modules/assets';
import { useSelector, useDispatch } from 'react-redux';
import copy from 'copy-to-clipboard';
import { useTenant, useEnv } from 'hooks/CustomHooks';
import { ResourceItem } from 'types';

export const ShoppingCartPreview = ({
  cart,
  setCart,
}: {
  cart: ResourceItem[];
  setCart: (cart: ResourceItem[]) => void;
}) => {
  const dispatch = useDispatch();
  const tenant = useTenant();
  const env = useEnv();
  const getFile = useSelector(fileSelector);
  const getTimeseries = useSelector(timeseriesSelector);
  const getAsset = useSelector(assetsSelector);

  useEffect(() => {
    dispatch(
      retrieveFiles(
        cart.filter(el => el.type === 'file').map(({ id }) => ({ id }))
      )
    );
    dispatch(
      retrieveAssets(
        cart.filter(el => el.type === 'asset').map(({ id }) => ({ id }))
      )
    );
    dispatch(
      retrieveTimeseries(
        cart.filter(el => el.type === 'timeSeries').map(({ id }) => ({ id }))
      )
    );
  }, [dispatch, cart]);

  const onDeleteClicked = (item: ResourceItem) => {
    setCart(cart.filter(el => el.type !== item.type && el.id !== item.id));
  };

  const renderDeleteItemButton = (item: ResourceItem) => (
    <Icon
      style={{
        alignSelf: 'center',
        color: Colors.danger.hex(),
      }}
      type="Delete"
      onClick={() => onDeleteClicked(item)}
    />
  );

  const assets: ResourceItem[] = [];
  const files: ResourceItem[] = [];
  const timeseries: ResourceItem[] = [];

  cart.forEach(el => {
    switch (el.type) {
      case 'asset': {
        assets.push(el);
        break;
      }
      case 'timeSeries': {
        timeseries.push(el);
        break;
      }
      case 'file': {
        files.push(el);
        break;
      }
    }
  });
  return (
    <div style={{ width: 300, position: 'relative' }}>
      <div style={{ height: '400px', overflowY: 'auto' }}>
        <Title level={5} style={{ marginBottom: 8 }}>
          Asset
        </Title>
        {assets.map(item => {
          const asset = getAsset(item.id);
          return (
            <ListItem
              key={item.id}
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
              {renderDeleteItemButton(item)}
            </ListItem>
          );
        })}
        <Title level={5} style={{ marginBottom: 8 }}>
          Time series
        </Title>
        {timeseries.map(item => {
          const ts = getTimeseries(item.id);
          return (
            <ListItem
              key={item.id}
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
              {renderDeleteItemButton(item)}
            </ListItem>
          );
        })}
        <Title level={5} style={{ marginBottom: 8 }}>
          Files
        </Title>
        {files.map(item => {
          const file = getFile(item.id);
          return (
            <ListItem
              key={item.id}
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
              {renderDeleteItemButton(item)}
            </ListItem>
          );
        })}
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
