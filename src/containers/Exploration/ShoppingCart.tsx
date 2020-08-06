import React, { useEffect } from 'react';
import { Asset, GetTimeSeriesMetadataDTO, FilesMetadata } from '@cognite/sdk';
import { Icon, Colors, Button } from '@cognite/cogs.js';
import { SmallTitle, ListItem } from 'components/Common';
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
        <SmallTitle>Asset</SmallTitle>
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
        <SmallTitle>Time series</SmallTitle>
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
        <SmallTitle>Files</SmallTitle>
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
      <Button
        style={{ width: '100%' }}
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
    </div>
  );
};
