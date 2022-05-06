import { Button, Detail } from '@cognite/cogs.js';
import { SetStateAction, useEffect, useState } from 'react';
import { NavLink, useLocation, useRouteMatch } from 'react-router-dom';
import debounce from 'lodash/debounce';
import { PriceAreaWithData } from 'types';
import { Plant } from '@cognite/power-ops-api-types';

import {
  Header,
  PanelContent,
  StyledPanel,
  StyledSearch,
  StyledButton,
  Footer,
} from './elements';

export const Sidebar = ({
  priceArea,
  opened,
  setOpened,
}: {
  priceArea: PriceAreaWithData;
  opened: boolean;
  setOpened: (opened: SetStateAction<boolean>) => void;
}) => {
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

  const search = (query: any, callback: any) => {
    const searchResults = priceArea.plants?.filter((plant) =>
      plant.displayName.toLowerCase().includes(query.toLowerCase())
    );
    if ('price scenarios'.includes(query.toLowerCase())) {
      setSearchPrice(true);
    } else {
      setSearchPrice(false);
    }
    if ('total'.includes(query.toLowerCase())) {
      setSearchTotal(true);
    } else {
      setSearchTotal(false);
    }
    callback(searchResults);
  };

  const debouncedSearch = debounce((query, callback) => {
    search(query, callback);
  }, 300);

  useEffect(() => {
    if (priceArea.plants) {
      debouncedSearch(query, (result: Plant[]) => {
        if (query.length === 0) {
          setSearchPrice(true);
          setSearchTotal(true);
          setFilteredPlants(priceArea.plants);
          setIsSearching(false);
        } else {
          setFilteredPlants(result);
          setIsSearching(true);
        }
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
            <NavLink to={`${match.url}/total`}>
              <StyledButton
                toggled={currentPath === `${match.url}/total`}
                key={`${priceArea.externalId}-total`}
                onClick={() => setQuery('')}
              >
                <p>Total</p>
              </StyledButton>
            </NavLink>
          )}
          {searchPrice && (
            <NavLink to={`${match.url}/price-scenarios`}>
              <StyledButton
                toggled={currentPath === `${match.url}/price-scenarios`}
                key={`${priceArea.externalId}-price-scenarios-link`}
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
                  key={`${priceArea.externalId}-${plant.externalId}`}
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
