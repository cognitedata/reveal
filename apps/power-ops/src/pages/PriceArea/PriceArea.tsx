import { useState, useContext, useEffect } from 'react';
import { useMetrics } from '@cognite/metrics';
import {
  Redirect,
  Route,
  Switch,
  useParams,
  useRouteMatch,
} from 'react-router-dom';
import { PriceScenarios } from 'pages/PriceScenarios';
import { BidMatrix } from 'components/BidMatrix';
import { PriceAreasContext } from 'providers/priceAreaProvider';
import { PortfolioHeader } from 'components/PortfolioHeader/PortfolioHeader';
import { Sidebar } from 'components/Sidebar/Sidebar';
import { BaseContainer } from 'styles/layout';
import { Loader } from '@cognite/cogs.js';
import { NotFoundPage } from 'pages/NotFound/NotFound';
import { useFetchPriceAreas } from 'queries/useFetchPriceArea';

import { Container, MainDiv } from './elements';

export const PriceArea = () => {
  const { bidProcessResult, bidProcessEventExternalId, priceAreaChanged } =
    useContext(PriceAreasContext);

  const {
    data: allPriceAreas = [],
    isFetching: isFetchingPriceAreas,
    isFetched: isPriceAreasFetched,
  } = useFetchPriceAreas();

  const { priceAreaExternalId } = useParams<{ priceAreaExternalId: string }>();

  const metrics = useMetrics('portfolio');
  const { path } = useRouteMatch();

  const [loading, setLoading] = useState<boolean>(true);
  const [openedSidePanel, setOpenedSidePanel] = useState(true);

  useEffect(() => {
    priceAreaChanged(priceAreaExternalId);
    setLoading(true);
  }, [priceAreaExternalId]);

  useEffect(() => {
    setLoading(true);
    if (bidProcessResult) {
      setLoading(false);
    }
  }, [bidProcessResult, bidProcessEventExternalId]);

  if (isFetchingPriceAreas)
    return <Loader infoText="Loading Price Areas" darkMode={false} />;

  if (isPriceAreasFetched && allPriceAreas.length === 0)
    return <NotFoundPage message="No Price Areas found on this project" />;

  if (loading && !bidProcessResult && priceAreaExternalId) {
    const found = allPriceAreas.find(
      (pa) => pa.externalId === priceAreaExternalId
    );
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
          key={bidProcessResult.priceAreaName}
          bidProcessResult={bidProcessResult}
          opened={openedSidePanel}
          setOpened={() => {
            setOpenedSidePanel(!openedSidePanel);
            metrics.track(
              `click-${openedSidePanel ? 'close' : 'open'}-portfolio-sidebar`
            );
          }}
        />
        <MainDiv sidePanelOpened={openedSidePanel}>
          <Switch>
            <Route path={`${path}/price-scenarios`}>
              <PriceScenarios bidProcessResult={bidProcessResult} />
            </Route>
            <Route path={`${path}/:plantExternalId`}>
              <BidMatrix bidProcessResult={bidProcessResult} />
            </Route>
            <Redirect from={path} to={`${path}/total`} />
          </Switch>
        </MainDiv>
      </Container>
    </BaseContainer>
  ) : null;
};
