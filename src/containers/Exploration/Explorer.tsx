import React, { useState, useEffect, useCallback, useContext } from 'react';
import { Switch, Route, useRouteMatch } from 'react-router-dom';
import { Button } from '@cognite/cogs.js';
import { RenderResourceActionsFunction } from 'types/Types';
import styled from 'styled-components';
import ResourceActionsContext from 'context/ResourceActionsContext';
import { FileExplorer } from 'containers/Files';
import { AssetExplorer } from 'containers/Assets';
import { SequenceExplorer } from 'containers/Sequences';
import { TimeseriesExplorer } from 'containers/Timeseries';
import { useHistory } from 'react-router';
import { useTenant } from 'hooks/CustomHooks';
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
  const history = useHistory();
  const tenant = useTenant();
  const { add, remove } = useContext(ResourceActionsContext);
  const [cart, setCart] = useState<ShoppingCart>({
    assets: [],
    timeseries: [],
    files: [],
  });

  const { pathname } = history.location;

  // TODO: use context provider in the future!
  const renderResourceActions: RenderResourceActionsFunction = useCallback(
    ({ fileId, assetId, timeseriesId, sequenceId }) => {
      const checkIsInCart = () => {
        if (fileId && cart.files.some(el => el === fileId)) {
          return true;
        }
        if (timeseriesId && cart.timeseries.some(el => el === timeseriesId)) {
          return true;
        }
        if (assetId && cart.assets.some(el => el === assetId)) {
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
        if (!pathname.includes(path)) {
          return (
            <Button
              type="secondary"
              key="view"
              onClick={() => {
                window.dispatchEvent(new Event('Resource Selected'));
                history.push(`/${tenant}/explore/${path}`);
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
              if (fileId) {
                setCart({
                  ...cart,
                  files: cart.files.filter(el => el !== fileId),
                });
              } else if (timeseriesId) {
                setCart({
                  ...cart,
                  timeseries: cart.timeseries.filter(el => el !== timeseriesId),
                });
              } else if (assetId) {
                setCart({
                  ...cart,
                  assets: cart.assets.filter(el => el !== timeseriesId),
                });
              }
            } else if (fileId) {
              setCart({
                ...cart,
                files: [...cart.files, fileId],
              });
            } else if (timeseriesId) {
              setCart({
                ...cart,
                timeseries: [...cart.timeseries, timeseriesId],
              });
            } else if (assetId) {
              setCart({
                ...cart,
                assets: [...cart.assets, assetId],
              });
            }
          }}
        >
          {isInCart ? 'Remove from Kit' : 'Add to Kit'}
        </Button>,
      ];
    },
    [cart, tenant, history, pathname]
  );

  useEffect(() => {
    console.log('asdf');
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
      <Switch>
        <Route path={`${match.path}/file/:fileId?`} component={FileExplorer} />
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
    </Wrapper>
  );
};
