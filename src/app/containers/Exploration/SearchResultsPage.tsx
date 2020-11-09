import React, {
  useEffect,
  useRef,
  useState,
  useContext,
  useCallback,
} from 'react';
import { ResourceItem, RenderResourceActionsFunction } from 'lib/types';
import { useHistory } from 'react-router-dom';
import { createLink } from '@cognite/cdf-utilities';
import { Button } from '@cognite/cogs.js';
import { ResourcePreviewProvider, ResourceActionsContext } from 'lib/context';
import { SearchResultFilters } from 'lib/components/Search/Filters';
import {
  SearchResult,
  Wrapper as SearchResultWrapper,
} from 'lib/components/Search/SearchResult';
import { ResourceTypeTabs } from 'lib/components/Search/ResourceTypeTabs';
import ExplorationNavBar from 'app/containers/Exploration/ExplorationNavbar';
import { trackUsage, Timer, trackTimedUsage } from 'app/utils/Metrics';
import ResourceSelectionContext, {
  useResourceFilter,
  useQuery,
  useSelectedResource,
} from 'lib/context/ResourceSelectionContext';
import { useDebounce } from 'use-debounce/lib';
import styled from 'styled-components';
import { CLOSE_DROPDOWN_EVENT } from 'lib/utils/WindowEvents';
import CollectionsDropdown from 'app/components/CollectionsDropdown';
import { useCollectionFeature } from 'app/utils/featureFlags';
import { useCurrentResourceType } from './hooks';

const Wrapper = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  height: calc(100% - 56px);
  background: #fff;
  overflow: hidden;
`;

function SearchPage() {
  const [
    currentResourceType,
    setCurrentResourceType,
  ] = useCurrentResourceType();
  const [showFilter, setShowFilter] = useState(false);
  const [query] = useQuery();
  const [debouncedQuery] = useDebounce(query, 100);

  const [cart, setCart] = useState<ResourceItem[]>([]);
  const { setOnSelectListener, setResourcesState } = useContext(
    ResourceSelectionContext
  );
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

  return (
    <ResourcePreviewProvider>
      <ResourceTypeTabs
        currentResourceType={currentResourceType}
        setCurrentResourceType={setCurrentResourceType}
      />

      <Wrapper>
        <SearchResultFilters
          visible={showFilter}
          currentResourceType={currentResourceType}
        />
        <SearchResultWrapper>
          <ExplorationNavBar
            toggleFilter={() => setShowFilter(!showFilter)}
            cart={cart}
            setCart={setCart}
          />
          <SearchResult query={debouncedQuery} type={currentResourceType} />
        </SearchResultWrapper>
      </Wrapper>
    </ResourcePreviewProvider>
  );
}

export const SearchResultsPage = () => {
  const history = useHistory();
  const showCollections = useCollectionFeature();

  const { pathname } = history.location;
  const { add, remove } = useContext(ResourceActionsContext);
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

      const collectionButton = () => {
        if (showCollections) {
          return (
            <CollectionsDropdown
              key="collections"
              type={resourceItem.type}
              items={[{ id: Number(resourceItem.id) }]}
              button={
                <Button icon="ChevronDownCompact" iconPlacement="right">
                  Add to collection
                </Button>
              }
            />
          );
        }
        return null;
      };

      return [viewButton(), collectionButton()];
    },
    [history, pathname, showCollections]
  );

  useEffect(() => {
    add('explore', renderResourceActions);
  }, [add, renderResourceActions]);

  useEffect(() => {
    return () => {
      remove('explore');
    };
  }, [remove]);

  const [resourceType] = useCurrentResourceType();

  const [query] = useQuery();
  const filter = useResourceFilter(resourceType);
  const { selectedResource } = useSelectedResource();

  useEffect(() => {
    trackUsage('Exploration.ResourceType', { resourceType });
  }, [resourceType]);

  useEffect(() => {
    trackUsage('Exploration.Filter', { resourceType, filter });
  }, [resourceType, filter]);

  useEffect(() => {
    if (query) {
      trackUsage('Exploration.Query', { query });
    }
  }, [query]);

  const timer = useRef<Timer>();

  useEffect(() => {
    if (selectedResource) {
      trackUsage('Exploration.PreviewResource', selectedResource);
      if (timer.current) {
        timer.current.stop({
          type: selectedResource.type,
          id: selectedResource.id,
        });
      }
    } else {
      timer.current = trackTimedUsage('Exploration.SearchTime');
    }

    return () => timer.current?.stop();
  }, [selectedResource]);

  return <SearchPage />;
};
