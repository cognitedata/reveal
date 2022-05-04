import { useState, useEffect, memo, useContext } from 'react';
import { Button, Detail, Label, Loader } from '@cognite/cogs.js';
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
import { Plant } from '@cognite/power-ops-api-types';
import PriceScenarios from 'pages/PriceScenarios';
import BidMatrix from 'pages/BidMatrix';
import { PAGES } from 'pages/Menubar';
import { PriceAreasContext } from 'providers/priceAreaProvider';
import { useAuthContext } from '@cognite/react-container';
import { downloadBidMatrices } from 'utils/utils';
import NotFoundPage from 'pages/Error404';

import {
  Container,
  Header,
  PanelContent,
  LeftPanel,
  StyledSearch,
  StyledButton,
  StyledTitle,
  Footer,
  RightPanel,
} from './elements';

const PortfolioPage = () => {
  const { client } = useAuthContext();
  const { authState } = useAuthContext();

  const { priceArea, allPriceAreas, priceAreaChanged } =
    useContext(PriceAreasContext);

  const history = useHistory();
  const location = useLocation();
  const match = useRouteMatch();

  const { priceAreaExternalId } = useParams<{ priceAreaExternalId?: string }>();

  const [loading, setLoading] = useState<boolean>(true);
  const [query, setQuery] = useState<string>('');
  const [allPlants, setAllPlants] = useState<Plant[]>();
  const [filteredPlants, setFilteredPlants] = useState<Plant[]>([]);
  const [searchPrice, setSearchPrice] = useState<boolean>(true);
  const [searchTotal, setSearchTotal] = useState<boolean>(true);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [downloading, setDownloading] = useState<boolean>(false);
  const [open, setOpen] = useState<boolean>(true);
  const [focused, setFocused] = useState<boolean>(false);
  const [resize, setResize] = useState<boolean>(false);

  const startDate = priceArea
    ? new Date(priceArea?.totalMatrixes?.[0].startTime).toLocaleString()
    : undefined;

  const search = (query: any, callback: any) => {
    const searchResults = allPlants?.filter((plant) =>
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
    if (!priceAreaExternalId) {
      const [firstPriceArea] = allPriceAreas || [];
      if (firstPriceArea) {
        history.push(`${PAGES.PORTFOLIO}/${firstPriceArea.externalId}/total`);
        priceAreaChanged(firstPriceArea.externalId);
        setLoading(true);
      }
    } else {
      if (!window.location.pathname.split('/')[4])
        history.push(`${PAGES.PORTFOLIO}/${priceAreaExternalId}/total`);
      priceAreaChanged(priceAreaExternalId);
      setLoading(true);
    }
  }, [allPriceAreas]);

  useEffect(() => {
    if (priceArea) {
      setLoading(false);
      setAllPlants(priceArea.plants);
      setFilteredPlants(priceArea.plants);
    }
  }, [priceArea]);

  if (!allPriceAreas) {
    return loading ? (
      <Loader infoText="Loading Price Areas" darkMode={false} />
    ) : (
      <NotFoundPage message="No Price Areas found on this project" />
    );
  }

  if (loading && !priceArea && priceAreaExternalId) {
    const found = allPriceAreas.filter(
      (pricearea) => pricearea.externalId === priceAreaExternalId
    ).length;
    return found ? (
      <Loader
        infoTitle="Loading Price Area:"
        infoText={priceAreaExternalId}
        darkMode={false}
      />
    ) : (
      <NotFoundPage
        message={`Could not find Price Area: ${priceAreaExternalId}`}
      />
    );
  }

  return priceArea ? (
    <BaseContainer>
      <Header className="top">
        <div>
          <StyledTitle level={5}>Price Area NO 1</StyledTitle>
          <Label size="small" variant="unknown">
            {`Matrix generation started: ${startDate}`}
          </Label>
        </div>
        <Button
          icon="Download"
          type="primary"
          loading={downloading}
          onClick={async () => {
            setDownloading(true);
            await downloadBidMatrices(
              priceArea,
              client?.project,
              authState?.token
            );
            setDownloading(false);
          }}
        >
          Download
        </Button>
      </Header>
      <Container sidePanelOpen={open}>
        <LeftPanel>
          <Header className="search">
            {open ? (
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
                  setOpen(true);
                  setFocused(true);
                }}
              />
            )}
          </Header>
          {open && (
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
                    toggled={
                      location.pathname === `${match.url}/price-scenarios`
                    }
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
                          location.pathname ===
                          `${match.url}/${plant.externalId}`
                        }
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
              icon={open ? 'PanelLeft' : 'PanelRight'}
              onClick={() => {
                setOpen(!open);
                setFocused(false);
              }}
            >
              {open && 'Hide'}
            </Button>
          </Footer>
        </LeftPanel>
        <RightPanel>
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
        </RightPanel>
      </Container>
    </BaseContainer>
  ) : null;
};

export const Portfolio = memo(PortfolioPage);
