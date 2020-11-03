import React, { useState, useEffect, useCallback, useContext } from 'react';
import { Switch, Route, useRouteMatch } from 'react-router-dom';
import { Button } from '@cognite/cogs.js';
import { RenderResourceActionsFunction } from 'lib/types/Types';
import styled from 'styled-components';
import ResourceActionsContext from 'lib/context/ResourceActionsContext';
import { FilePage } from 'app/containers/FilePage';
import { useHistory } from 'react-router';
import ResourceSelectionContext from 'lib/context/ResourceSelectionContext';
import { ResourceItem } from 'lib/types';
import { ResourcePreviewProvider } from 'lib/context/ResourcePreviewContext';
import { ResourceSelectorProvider } from 'lib/context/ResourceSelectorContext';
import { CLOSE_DROPDOWN_EVENT } from 'lib/utils/WindowEvents';
import { AssetPage } from 'app/containers/AssetPage';
import { SequencePage } from 'app/containers/SequencePage';
import { TimeseriesPage } from 'app/containers/TimeseriesPage';
import { EventPage } from 'app/containers/EventPage';
import { SearchResultsPage } from 'app/containers/SearchResultsPage';
import { createLink } from '@cognite/cdf-utilities';
import { ExplorationNavbar } from './ExplorationNavbar';

const Wrapper = styled.div`
  flex: 1;
  height: 100%;
  display: flex;
  flex-direction: column;
`;

export const Explorer = () => {
  const history = useHistory();
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
              resourceName = 'Time series';
              path = `timeSeries/${resourceItem.id}`;
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
                  window.dispatchEvent(new Event(CLOSE_DROPDOWN_EVENT));
                  history.push(createLink(`/explore/${path}`));
                }}
                icon="ArrowRight"
              >
                View {resourceName.toLowerCase()}
              </Button>
            );
          }
        }
        return null;
      };

      return [viewButton()];
    },
    [history, pathname]
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
            <Route
              path={`${match.path}/:resourceType?`}
              component={SearchResultsPage}
            />
          </Switch>
        </ResourcePreviewProvider>
      </ResourceSelectorProvider>
    </Wrapper>
  );
};
