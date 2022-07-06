import { useState, useEffect, memo, useContext } from 'react';
import { Loader } from '@cognite/cogs.js';
import { useMetrics } from '@cognite/metrics';
import {
  Route,
  Switch,
  useHistory,
  useParams,
  useRouteMatch,
} from 'react-router-dom';
import { PAGES } from 'App';
import { PriceScenarios } from 'pages/PriceScenarios';
import { BidMatrix } from 'components/BidMatrix';
import { PriceAreasContext } from 'providers/priceAreaProvider';
import { NotFoundPage } from 'pages/NotFound/NotFound';
import { PortfolioHeader } from 'components/PortfolioHeader/PortfolioHeader';
import { Sidebar } from 'components/Sidebar/Sidebar';
import { BaseContainer } from 'styles/layout';

import { Container, MainDiv } from './elements';

const PortfolioPage = () => {
  const {
    priceArea,
    allPriceAreas,
    bidProcessEventExternalId,
    priceAreaChanged,
  } = useContext(PriceAreasContext);

  const { priceAreaExternalId } = useParams<{ priceAreaExternalId?: string }>();

  const metrics = useMetrics('portfolio');
  const history = useHistory();
  const match = useRouteMatch();

  const [loading, setLoading] = useState<boolean>(true);
  const [openedSidePanel, setOpenedSidePanel] = useState<boolean>(true);

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
    metrics.track(
      `click-${openedSidePanel ? 'open' : 'close'}-portfolio-sidebar`
    );
  }, [openedSidePanel]);

  useEffect(() => {
    setLoading(true);
    if (priceArea) {
      setLoading(false);
    }
  }, [priceArea, bidProcessEventExternalId]);

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
        infoTitle="Loading Price Area Data:"
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
      <PortfolioHeader priceArea={priceArea} />
      <Container>
        <Sidebar
          priceArea={priceArea}
          opened={openedSidePanel}
          setOpened={setOpenedSidePanel}
        />
        <MainDiv sidePanelOpened={openedSidePanel}>
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
        </MainDiv>
      </Container>
    </BaseContainer>
  ) : null;
};

export const Portfolio = memo(PortfolioPage);
