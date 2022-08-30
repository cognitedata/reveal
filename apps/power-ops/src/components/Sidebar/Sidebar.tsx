import { Button, Detail } from '@cognite/cogs.js';
import { SetStateAction, useCallback, useEffect, useState } from 'react';
import { NavLink, useLocation, useRouteMatch } from 'react-router-dom';
import debounce from 'lodash/debounce';
import { BidProcessResultWithData } from 'types';
import { Plant } from '@cognite/power-ops-api-types';
import { useMetrics } from '@cognite/metrics';

import {
  Header,
  PanelContent,
  StyledPanel,
  StyledSearch,
  StyledButton,
  Footer,
} from './elements';

export const Sidebar = ({
  bidProcessResult,
  opened,
  setOpened,
}: {
  bidProcessResult: BidProcessResultWithData;
  opened: boolean;
  setOpened: (opened: SetStateAction<boolean>) => void;
}) => {
  const metrics = useMetrics('portfolio');

  const { pathname } = useLocation();
  const currentPath = pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
  const match = useRouteMatch();

  const [query, setQuery] = useState<string>('');
  const [searchPrice, setSearchPrice] = useState<boolean>(true);
  const [searchTotal, setSearchTotal] = useState<boolean>(true);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [filteredPlants, setFilteredPlants] = useState<Plant[]>([]);
  const [focused, setFocused] = useState<boolean>(false);
  const [resize, setResize] = useState<boolean>(false);

  const trackSidebarNavLinkClick = (selectedSection: string) => {
    if (selectedSection === 'total') {
      metrics.track('click-sidebar-total-link');
    } else if (selectedSection === 'price-scenarios') {
      metrics.track('click-sidebar-price-scenarios-link');
    } else {
      metrics.track('click-sidebar-plant-link', {
        selectedPlant: selectedSection,
      });
    }
  };

  const debouncedSearch = useCallback(
    debounce((query: any, callback: any) => {
      if (query) {
        metrics.track('type-search-input', { query });
      }

      const searchResults = bidProcessResult.plants?.filter((plant) =>
        plant.displayName.toLowerCase().includes(query.toLowerCase())
      );
      callback(searchResults);
    }, 300),
    []
  );

  useEffect(() => {
    if (bidProcessResult.plants) {
      debouncedSearch(query, (result: Plant[]) => {
        setSearchPrice('price scenarios'.includes(query.toLowerCase()));
        setSearchTotal('total'.includes(query.toLowerCase()));
        setFilteredPlants(query?.length ? result : bidProcessResult.plants);
        setIsSearching(!!query?.length);
      });
    }
  }, [query]);

  return (
    <StyledPanel sidePanelOpened={opened}>
      <Header>
        {opened ? (
          <StyledSearch
            icon="Search"
            placeholder="Search plants"
            autoFocus={focused}
            onChange={(e) => setQuery(e.target.value)}
            value={query}
            clearable={{
              callback: () => {
                metrics.track('click-clear-search-button');
                setQuery('');
              },
            }}
          />
        ) : (
          <Button
            type="secondary"
            icon="Search"
            aria-label="Open search field"
            onClick={() => {
              metrics.track('click-open-search-button');
              setOpened(true);
              setFocused(true);
            }}
          />
        )}
      </Header>
      {opened && (
        <PanelContent>
          {!isSearching && <Detail>Price area overview</Detail>}
          {searchTotal && (
            <NavLink
              to={`${match.url}/total`}
              onClick={() => trackSidebarNavLinkClick('total')}
            >
              <StyledButton
                toggled={currentPath === `${match.url}/total`}
                key={`${bidProcessResult.priceAreaExternalId}-total`}
                onClick={() => setQuery('')}
              >
                <p>Total</p>
              </StyledButton>
            </NavLink>
          )}
          {searchPrice && (
            <NavLink
              to={`${match.url}/price-scenarios`}
              onClick={() => trackSidebarNavLinkClick('price-scenarios')}
            >
              <StyledButton
                toggled={currentPath === `${match.url}/price-scenarios`}
                key={`${bidProcessResult.priceAreaExternalId}-price-scenarios-link`}
                onClick={() => setQuery('')}
              >
                <p>Price Scenarios</p>
              </StyledButton>
            </NavLink>
          )}
          {!isSearching && <Detail>Plants</Detail>}
          {filteredPlants &&
            filteredPlants.map((plant) => {
              return (
                <NavLink
                  to={`${match.url}/${plant.externalId}`}
                  key={`${bidProcessResult.priceAreaExternalId}-${plant.externalId}`}
                  onClick={() =>
                    trackSidebarNavLinkClick(
                      bidProcessResult.priceAreaExternalId
                    )
                  }
                >
                  <StyledButton
                    toggled={currentPath === `${match.url}/${plant.externalId}`}
                    key={plant.externalId}
                    onClick={() => setQuery('')}
                  >
                    <p>{plant.displayName}</p>
                  </StyledButton>
                </NavLink>
              );
            })}
        </PanelContent>
      )}
      <Footer onTransitionEnd={() => setResize(!resize)}>
        <Button
          type="secondary"
          aria-label="Show or hide sidebar"
          icon={opened ? 'PanelLeft' : 'PanelRight'}
          onClick={() => {
            setOpened(!opened);
            setFocused(false);
          }}
        >
          {opened && 'Hide'}
        </Button>
      </Footer>
    </StyledPanel>
  );
};
