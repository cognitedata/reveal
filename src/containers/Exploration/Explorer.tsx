import React, { useState, useEffect, useCallback, useContext } from 'react';
import { Switch, Route, useRouteMatch } from 'react-router-dom';
import { Button } from '@cognite/cogs.js';
import { itemSelector as fileSelector } from 'modules/files';
import { itemSelector as timeseriesSelector } from 'modules/timeseries';
import { itemSelector as assetsSelector } from 'modules/assets';
import { useSelector } from 'react-redux';
import { RenderResourceActionsFunction } from 'types/Types';
import styled from 'styled-components';
import ResourceActionsContext from 'context/ResourceActionsContext';
import { FileExplorer } from 'containers/Files';
import { AssetExplorer } from 'containers/Assets';
import { SequenceExplorer } from 'containers/Sequences';
import { TimeseriesExplorer } from 'containers/Timeseries';
import { useScopedHistory } from 'hooks/CustomHooks';
import { ShoppingCart } from './ShoppingCart';
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
  const history = useScopedHistory();
  const { add, remove } = useContext(ResourceActionsContext);
  const [cart, setCart] = useState<ShoppingCart>({
    assets: {},
    timeseries: {},
    files: {},
  });
  const getFile = useSelector(fileSelector);
  const getTimeseries = useSelector(timeseriesSelector);
  const getAssets = useSelector(assetsSelector);

  // TODO: use context provider in the future!
  const renderResourceActions: RenderResourceActionsFunction = useCallback(
    ({ fileId, assetId, timeseriesId, sequenceId }) => {
      const checkIsInCart = () => {
        if (fileId && cart.files[fileId]) {
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

      const viewButton = () => {
        let resourceName = '';
        let path = '';
        if (assetId) {
          resourceName = 'Asset';
          path = `asset/${assetId}`;
        }
        if (timeseriesId) {
          resourceName = 'Time Series';
          path = `timeseries/${timeseriesId}`;
        }
        if (fileId) {
          resourceName = 'File';
          path = `file/${fileId}`;
        }
        if (sequenceId) {
          resourceName = 'Sequence';
          path = `sequence/${sequenceId}`;
        }
        if (!history.location.pathname.includes(path)) {
          return (
            <Button
              type="secondary"
              key="view"
              onClick={() => {
                window.dispatchEvent(new Event('Resource Selected'));
                history.push(`/explore/${path}`);
              }}
              icon="ArrowRight"
            >
              View {resourceName}
            </Button>
          );
        }
        return null;
      };

      return [
        viewButton(),
        <Button
          key="add-to-cart"
          type={isInCart ? 'secondary' : 'primary'}
          onClick={() => {
            if (isInCart) {
              const newCart = { ...cart };
              if (fileId) {
                delete newCart.files[fileId];
              } else if (timeseriesId) {
                delete newCart.timeseries[timeseriesId];
              } else if (assetId) {
                delete newCart.assets[assetId];
              }
              setCart(newCart);
            } else if (fileId && getFile(fileId)) {
              setCart({
                ...cart,
                files: { ...cart.files, [fileId]: getFile(fileId)! },
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
    },
    [cart, history, getAssets, getFile, getTimeseries]
  );

  useEffect(() => {
    add('cart', renderResourceActions);
  }, [add, renderResourceActions]);

  useEffect(() => {
    return () => {
      remove('cart');
    };
  }, [remove]);

  const match = useRouteMatch();

  return (
    <Wrapper>
      <ExplorationNavbar cart={cart} setCart={setCart} />
      <div style={{ flex: 1, overflow: 'gone' }}>
        <Switch>
          <Route
            path={`${match.path}/file/:fileId?`}
            component={FileExplorer}
          />
          <Route
            path={`${match.path}/asset/:assetId?`}
            component={AssetExplorer}
          />
          <Route
            path={`${match.path}/sequence/:sequenceId?`}
            component={SequenceExplorer}
          />
          <Route
            path={`${match.path}/timeseries/:timeseriesId?`}
            component={TimeseriesExplorer}
          />
        </Switch>
      </div>
    </Wrapper>
  );
};
