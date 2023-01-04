import { useState } from 'react';
import {
  Redirect,
  Route,
  Switch,
  useLocation,
  useParams,
  useRouteMatch,
} from 'react-router-dom-v5';
import { useMetrics } from '@cognite/metrics';
import { PriceScenariosContainer } from 'pages/PriceScenarios/PriceScenariosContainer';
import { BidMatrixContainer } from 'components/BidMatrix/BidMatrixContainer';
import { DayAheadMarketHeaderContainer } from 'components/DayAheadMarketHeader/DayAheadMarketHeaderContainer';
import { PriceAreaSidebarContainer } from 'components/PriceAreaSidebar/PriceAreaSidebarContainer';
import { NewDayAheadDataAvailableBar } from 'components/NewDayAheadDataAvailableBar/NewDayAheadDataAvailableBar';
import { ShopQualityAssuranceModal } from 'components/ShopQualityAssuranceModal/ShopQualityAssuranceModal';
import { useNewBidMatrixAvailable } from 'hooks/useNewBidMatrixAvailable';
import { MethodPerformanceContainer } from 'pages/MethodPerformance/MethodPerformance';
import { SECTIONS } from 'types';

import { Container, MainDiv, MainContainer } from './elements';

export const PriceArea = () => {
  const { path } = useRouteMatch();
  const { pathname } = useLocation();

  const metrics = useMetrics('bid-matrix');

  const { priceAreaExternalId } = useParams<{
    priceAreaExternalId: string;
  }>();

  const [sidebarOpen, setSidePanelOpen] = useState(true);

  const [bidProcessEventExternalId, setBidProcessEventExternalId] =
    useState('');

  const newMatrixAvailable = useNewBidMatrixAvailable(
    priceAreaExternalId,
    bidProcessEventExternalId
  );

  const handleReloadClick = () => {
    metrics.track('click-reload-bid-matrix-button', { priceAreaExternalId });
    window.location.reload();
  };

  return (
    <MainContainer data-testid="pricearea-page">
      <DayAheadMarketHeaderContainer
        bidProcessEventExternalId={bidProcessEventExternalId}
        onChangeBidProcessEventExternalId={setBidProcessEventExternalId}
      />
      {!pathname.includes(SECTIONS.BENCHMARKING) && newMatrixAvailable && (
        <NewDayAheadDataAvailableBar onReloadClick={handleReloadClick} />
      )}
      {!pathname.includes(SECTIONS.BENCHMARKING) && (
        <ShopQualityAssuranceModal
          bidProcessEventExternalId={bidProcessEventExternalId}
        />
      )}
      <Container>
        <PriceAreaSidebarContainer
          bidProcessEventExternalId={bidProcessEventExternalId}
          open={sidebarOpen}
          onOpenClose={setSidePanelOpen}
        />
        <MainDiv sidebarOpen={sidebarOpen}>
          <Switch>
            <Route path={`${path}/${SECTIONS.PRICE_SCENARIOS}`}>
              <PriceScenariosContainer
                bidProcessEventExternalId={bidProcessEventExternalId}
              />
            </Route>
            <Route path={`${path}/${SECTIONS.BENCHMARKING}`}>
              <MethodPerformanceContainer priceAreaId={priceAreaExternalId} />
            </Route>
            <Route path={`${path}/:plantExternalId`}>
              <BidMatrixContainer
                bidProcessEventExternalId={bidProcessEventExternalId}
              />
            </Route>
            <Redirect from={path} to={`${path}/${SECTIONS.TOTAL}`} />
          </Switch>
        </MainDiv>
      </Container>
    </MainContainer>
  );
};
