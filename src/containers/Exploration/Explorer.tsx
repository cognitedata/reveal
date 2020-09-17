import React, { useState, useEffect, useCallback, useContext } from 'react';
import { Switch, Route, useRouteMatch } from 'react-router-dom';
import { Button } from '@cognite/cogs.js';
import { RenderResourceActionsFunction } from 'types/Types';
import styled from 'styled-components';
import ResourceActionsContext from 'context/ResourceActionsContext';
import { FilePage } from 'containers/Files';
import { AssetPage } from 'containers/Assets';
import { SequencePage } from 'containers/Sequences';
import { TimeseriesPage } from 'containers/Timeseries';
import { EventPage } from 'containers/Events';
import { useHistory } from 'react-router';
import { useTenant } from 'hooks/CustomHooks';
import ResourceSelectionContext from 'context/ResourceSelectionContext';
import { ResourceItem } from 'types';
import { ResourcePreviewProvider } from 'context/ResourcePreviewContext';
import { SearchResults } from 'containers/SearchResults';
import { ResourceSelectorProvider } from 'context/ResourceSelectorContext';
import { ExplorationNavbar } from './ExplorationNavbar';

const Wrapper = styled.div`
  flex: 1;
  height: 100%;
  display: flex;
  flex-direction: column;
`;

export const Explorer = () => {
  const history = useHistory();
  const tenant = useTenant();
  const { add, remove } = useContext(ResourceActionsContext);
  const { setOnSelectListener, setResourcesState } = useContext(
    ResourceSelectionContext
  );
  const [cart, setCart] = useState<ResourceItem[]>([]);

  const { pathname } = history.location;

  const renderResourceActions: RenderResourceActionsFunction = useCallback(
    resourceItem => {
      const viewButton = () => {
        let resourceName = '';
        let path = '';
        if (resourceItem) {
          switch (resourceItem.type) {
            case 'asset': {
              resourceName = 'Asset';
              path = `asset/${resourceItem.id}`;
              break;
            }
            case 'timeSeries': {
              resourceName = 'Time Series';
              path = `timeseries/${resourceItem.id}`;
              break;
            }
            case 'file': {
              resourceName = 'File';
              path = `file/${resourceItem.id}`;
              break;
            }
            case 'sequence': {
              resourceName = 'Sequence';
              path = `sequence/${resourceItem.id}`;
              break;
            }
            case 'event': {
              resourceName = 'Event';
              path = `event/${resourceItem.id}`;
              break;
            }
          }
          if (!pathname.includes(path)) {
            return (
              <Button
                type="primary"
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
        }
        return null;
      };

      return [viewButton()];
    },
    [tenant, history, pathname]
  );

  useEffect(() => {
    add('explore', renderResourceActions);
  }, [add, renderResourceActions]);

  useEffect(() => {
    return () => {
      remove('explore');
    };
  }, [remove]);

  useEffect(() => {
    setOnSelectListener(() => (item: ResourceItem) => {
      const index = cart.findIndex(
        el => el.type === item.type && el.id === item.id
      );
      if (index > -1) {
        setCart(cart.slice(0, index).concat(cart.slice(index + 1)));
      } else {
        setCart(cart.concat([item]));
      }
    });
  }, [setOnSelectListener, cart]);

  useEffect(() => {
    setResourcesState(cart.map(el => ({ ...el, state: 'selected' })));
  }, [setResourcesState, cart]);

  const match = useRouteMatch();

  return (
    <Wrapper>
      <ExplorationNavbar cart={cart} setCart={setCart} />
      <ResourceSelectorProvider>
        <ResourcePreviewProvider>
          <Switch>
            <Route path={`${match.path}/file/:fileId`} component={FilePage} />
            <Route
              path={`${match.path}/asset/:assetId`}
              component={AssetPage}
            />
            <Route
              path={`${match.path}/sequence/:sequenceId`}
              component={SequencePage}
            />
            <Route
              path={`${match.path}/timeseries/:timeseriesId`}
              component={TimeseriesPage}
            />
            <Route
              path={`${match.path}/event/:eventId`}
              component={EventPage}
            />
            <Route path={`${match.path}/`} component={SearchResults} />
          </Switch>
        </ResourcePreviewProvider>
      </ResourceSelectorProvider>
    </Wrapper>
  );
};
