import React, { useEffect } from 'react';
import { Asset, GetTimeSeriesMetadataDTO, FilesMetadata } from '@cognite/sdk';
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

export type ShoppingCartWithContent = {
  assets: {
    [key: number]: Asset;
  };
  timeseries: {
    [key: number]: GetTimeSeriesMetadataDTO;
  };
  files: {
    [key: number]: FilesMetadata;
  };
};
export type ShoppingCart = {
  assets: number[];
  timeseries: number[];
  files: number[];
};
export const ShoppingCartPreview = ({
  cart,
  setCart,
}: {
  cart: ShoppingCart;
  setCart: (cart: ShoppingCart) => void;
}) => {
  const dispatch = useDispatch();
  const tenant = useTenant();
  const env = useEnv();
  const getFile = useSelector(fileSelector);
  const getTimeseries = useSelector(timeseriesSelector);
  const getAsset = useSelector(assetsSelector);

  useEffect(() => {
    dispatch(retrieveFiles(cart.files.map(id => ({ id }))));
    dispatch(retrieveAssets(cart.assets.map(id => ({ id }))));
    dispatch(retrieveTimeseries(cart.timeseries.map(id => ({ id }))));
  }, [dispatch, cart]);

  const onDeleteClicked = ({
    assetId,
    timeseriesId,
    fileId,
  }: {
    assetId?: number;
    timeseriesId?: number;
    fileId?: number;
  }) => {
    const newCart = { ...cart };
    if (fileId) {
      delete newCart.files[fileId];
    } else if (timeseriesId) {
      delete newCart.timeseries[timeseriesId];
    } else if (assetId) {
      delete newCart.assets[assetId];
    }
    setCart(newCart);
  };

  const renderDeleteItemButton = (ids: {
    assetId?: number;
    timeseriesId?: number;
    fileId?: number;
  }) => (
    <Icon
      style={{
        alignSelf: 'center',
        color: Colors.danger.hex(),
      }}
      type="Delete"
      onClick={() => onDeleteClicked(ids)}
    />
  );
  return (
    <div style={{ width: 300, position: 'relative' }}>
      <div style={{ height: '400px', overflowY: 'auto' }}>
        <Title level={5} style={{ marginBottom: 8 }}>
          Asset
        </Title>
        {Object.values(cart.assets).map(el => {
          const asset = getAsset(el);
          return (
            <ListItem
              key={el}
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
              {renderDeleteItemButton({ assetId: el })}
            </ListItem>
          );
        })}
        <Title level={5} style={{ marginBottom: 8 }}>
          Time series
        </Title>
        {Object.values(cart.timeseries).map(el => {
          const ts = getTimeseries(el);
          return (
            <ListItem
              key={el}
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
              {renderDeleteItemButton({ timeseriesId: el })}
            </ListItem>
          );
        })}
        <Title level={5} style={{ marginBottom: 8 }}>
          Files
        </Title>
        {Object.values(cart.files).map(el => {
          const file = getFile(el);
          return (
            <ListItem
              key={el}
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
              {renderDeleteItemButton({ fileId: el })}
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
                  if (cart.assets.length > 0) {
                    urls.push(
                      `Assets?$filter=${cart.assets
                        .map(id => `(Id eq ${id})`)
                        .join(' or ')}`
                    );
                  }
                  if (cart.timeseries.length > 0) {
                    urls.push(
                      `Timeseries?$filter=${cart.timeseries
                        .map(id => `(Id eq ${id})`)
                        .join(' or ')}`
                    );
                  }
                  if (cart.files.length > 0) {
                    urls.push(
                      `Files?$filter=${cart.files
                        .map(id => `(Id eq ${id})`)
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
