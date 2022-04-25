import { useState, useEffect, memo, useContext } from 'react';
import { Button, Detail, Label } from '@cognite/cogs.js';
import { BaseContainer } from 'pages/elements';
import debounce from 'lodash/debounce';
import {
  NavLink,
  Route,
  Switch,
  useHistory,
  useLocation,
  useParams,
  useRouteMatch,
} from 'react-router-dom';
import { Plant, PriceArea } from '@cognite/power-ops-api-types';
import PriceScenarios from 'pages/PriceScenarios';
import BidMatrix from 'pages/BidMatrix';
import { PAGES } from 'pages/Menubar';
import { PriceAreasContext } from 'providers/priceAreasProvider';

import {
  Container,
  Header,
  PanelContent,
  LeftPanel,
  StyledSearch,
  StyledButton,
  StyledTitle,
} from './elements';

const PortfolioPage = () => {
  const { priceAreas } = useContext(PriceAreasContext);

  const history = useHistory();
  const location = useLocation();
  const match = useRouteMatch();

  const { priceAreaExternalId } = useParams<{ priceAreaExternalId?: string }>();

  const [query, setQuery] = useState<string>('');
  const [allPlants, setAllPlants] = useState<Plant[]>();
  const [filteredPlants, setFilteredPlants] = useState<Plant[]>([]);
  const [searchPrice, setSearchPrice] = useState<boolean>(true);
  const [searchTotal, setSearchTotal] = useState<boolean>(true);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [priceArea, setPriceArea] = useState<PriceArea | undefined>();

  const startDate = priceArea
    ? new Date(priceArea?.totalMatrixes?.[0].startTime).toLocaleString()
    : undefined;

  const search = (query: any, callback: any) => {
    const searchResults = allPlants?.filter((plant) =>
      plant.name.toLowerCase().includes(query.toLowerCase())
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
    if (allPlants) {
      debouncedSearch(query, (result: Plant[]) => {
        if (query.length === 0) {
          setSearchPrice(true);
          setSearchTotal(true);
          setFilteredPlants(allPlants);
          setIsSearching(false);
        } else {
          setFilteredPlants(result);
          setIsSearching(true);
        }
      });
    }
  }, [query]);

  useEffect(() => {
    if (priceAreas?.length) {
      const firstAreaId = priceAreas?.[0].externalId || undefined;
      if (priceAreaExternalId) {
        const foundArea = priceAreas.find(
          (area) => area.externalId === priceAreaExternalId
        );
        setPriceArea(foundArea);
      }
      history.push(
        `${PAGES.PORTFOLIO}/${priceAreaExternalId || firstAreaId}/total`
      );
    }
  }, [priceAreaExternalId, priceAreas]);

  useEffect(() => {
    if (priceArea) {
      // Get list of plants
      setAllPlants(priceArea.plants);
      setFilteredPlants(priceArea.plants);
    }
  }, [priceArea]);

  if (!priceArea) return <div>No Price Area Found</div>;

  return (
    <BaseContainer>
      <Header className="top">
        <div>
          <StyledTitle level={5}>Price Area NO 1</StyledTitle>
          <Label size="small" variant="unknown">
            {`Matrix generation started: ${startDate}`}
          </Label>
        </div>
        <Button icon="Download" type="primary">
          Download
        </Button>
      </Header>
      <Container>
        <LeftPanel>
          <Header className="search">
            <StyledSearch
              icon="Search"
              placeholder="Search plants"
              onChange={(e) => setQuery(e.target.value)}
              value={query}
              clearable={{
                callback: () => {
                  setQuery('');
                },
              }}
            />
          </Header>
          <PanelContent>
            {!isSearching && <Detail>Price area overview</Detail>}
            {searchTotal && (
              <NavLink to={`${match.url}/total`}>
                <StyledButton
                  toggled={location.pathname === `${match.url}/total`}
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
                  toggled={location.pathname === `${match.url}/price-scenarios`}
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
                      toggled={
                        location.pathname === `${match.url}/${plant.externalId}`
                      }
                      key={plant.externalId}
                      onClick={() => setQuery('')}
                    >
                      <p>{plant.name}</p>
                    </StyledButton>
                  </NavLink>
                );
              })}
          </PanelContent>
        </LeftPanel>
        <Switch>
          <Route path={`${match.path}/price-scenarios`}>
            <PriceScenarios priceArea={priceArea} />
          </Route>
          <Route exact path={`${match.path}/:plantExternalId`}>
            <BidMatrix priceArea={priceArea} />
          </Route>
          <Route path={`${match.path}/:plantExternalId/price-scenarios`}>
            <PriceScenarios priceArea={priceArea} />
          </Route>
        </Switch>
      </Container>
    </BaseContainer>
  );
};

export const Portfolio = memo(PortfolioPage);
