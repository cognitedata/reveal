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
    bidProcessResult,
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
    if (bidProcessResult) {
      setLoading(false);
    }
  }, [bidProcessResult, bidProcessEventExternalId]);

  if (!allPriceAreas) {
    return loading ? (
      <Loader infoText="Loading Price Areas" darkMode={false} />
    ) : (
      <NotFoundPage message="No Price Areas found on this project" />
    );
  }

  if (loading && !bidProcessResult && priceAreaExternalId) {
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

  return bidProcessResult ? (
    <BaseContainer>
      <PortfolioHeader bidProcessResult={bidProcessResult} />
      <Container>
        <Sidebar
          bidProcessResult={bidProcessResult}
          opened={openedSidePanel}
          setOpened={setOpenedSidePanel}
        />
        <MainDiv sidePanelOpened={openedSidePanel}>
          <Switch>
            <Route path={`${match.path}/price-scenarios`}>
              <PriceScenarios bidProcessResult={bidProcessResult} />
            </Route>
            <Route exact path={`${match.path}/:plantExternalId`}>
              <BidMatrix bidProcessResult={bidProcessResult} />
            </Route>
            <Route path={`${match.path}/:plantExternalId/price-scenarios`}>
              <PriceScenarios bidProcessResult={bidProcessResult} />
            </Route>
          </Switch>
        </MainDiv>
      </Container>
    </BaseContainer>
  ) : null;
};

export const Portfolio = memo(PortfolioPage);
