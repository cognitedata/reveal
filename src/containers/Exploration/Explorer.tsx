import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@cognite/cogs.js';
import { itemSelector as fileSelector } from 'modules/files';
import { itemSelector as timeseriesSelector } from 'modules/timeseries';
import { itemSelector as assetsSelector } from 'modules/assets';
import { useSelector, useDispatch } from 'react-redux';
import { RenderResourceActionsFunction } from 'containers/HoverPreview';
import { trackUsage } from 'utils/Metrics';
import styled from 'styled-components';
import { useHistory } from 'react-router';
import { onResourceSelected } from 'modules/app';
import { ShoppingCart } from './ShoppingCart';
import { FileExplorer } from './FileExplorer';
import { ExplorationNavbar } from './ExplorationNavbar';

const Wrapper = styled.div`
  flex: 1;
  width: 100vw;
  height: calc(100vh - 64px);
  position: absolute;
  top: 0;
  left: 0;
  display: flex;
  flex-direction: column;
`;

export const Explorer = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  const { tenant, fileId } = useParams<{
    tenant: string;
    fileId: string | undefined;
  }>();
  const fileIdNumber = fileId ? parseInt(fileId, 10) : undefined;
  const [cart, setCart] = useState<ShoppingCart>({
    assets: {},
    timeseries: {},
    files: {},
  });
  const getFile = useSelector(fileSelector);
  const getTimeseries = useSelector(timeseriesSelector);
  const getAssets = useSelector(assetsSelector);

  // TODO: use context provider in the future!
  const renderResourceActions: RenderResourceActionsFunction = ({
    fileId: newFileId,
    assetId,
    timeseriesId,
  }) => {
    const checkIsInCart = () => {
      if (newFileId && cart.files[newFileId]) {
        return true;
      }
      if (timeseriesId && cart.timeseries[timeseriesId]) {
        return true;
      }
      if (assetId && cart.assets[assetId]) {
        return true;
      }
      return false;
    };

    const isInCart = checkIsInCart();

    return [
      <Button
        key="add-to-cart"
        type={isInCart ? 'secondary' : 'primary'}
        onClick={() => {
          if (isInCart) {
            const newCart = { ...cart };
            if (newFileId) {
              delete newCart.files[newFileId];
            } else if (timeseriesId) {
              delete newCart.timeseries[timeseriesId];
            } else if (assetId) {
              delete newCart.assets[assetId];
            }
            setCart(newCart);
          } else if (newFileId && getFile(newFileId)) {
            setCart({
              ...cart,
              files: { ...cart.files, [newFileId]: getFile(newFileId)! },
            });
          } else if (timeseriesId && getTimeseries(timeseriesId)) {
            setCart({
              ...cart,
              timeseries: {
                ...cart.timeseries,
                [timeseriesId]: getTimeseries(timeseriesId)!,
              },
            });
          } else if (assetId && getAssets(assetId)) {
            setCart({
              ...cart,
              assets: { ...cart.assets, [assetId]: getAssets(assetId)! },
            });
          }
        }}
      >
        {isInCart ? 'Remove from Kit' : 'Add to Kit'}
      </Button>,
    ];
  };
  const onFileSelected = (newFileId: number) => {
    history.push(`/${tenant}/explore/file/${newFileId}`);
  };
  const onAssetSelected = (id: number) => {
    dispatch(onResourceSelected({ assetId: id, showSidebar: true }, history));
  };
  const onSequenceSelected = (id: number) => {
    dispatch(
      onResourceSelected({ sequenceId: id, showSidebar: true }, history)
    );
  };

  useEffect(() => {
    trackUsage('Exploration.Load', { fileId: fileIdNumber });
  }, [fileIdNumber]);

  return (
    <Wrapper>
      <ExplorationNavbar
        cart={cart}
        setCart={setCart}
        renderResourceActions={renderResourceActions}
        onFileSelected={onFileSelected}
        onAssetSelected={onAssetSelected}
      />
      <div style={{ flex: 1, overflow: 'gone' }}>
        <FileExplorer
          renderResourceActions={renderResourceActions}
          onFileSelected={onFileSelected}
          onAssetSelected={onAssetSelected}
          onSequenceSelected={onSequenceSelected}
        />
      </div>
    </Wrapper>
  );
};
