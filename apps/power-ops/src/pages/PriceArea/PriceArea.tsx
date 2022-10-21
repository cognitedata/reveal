import { useState } from 'react';
import {
  Redirect,
  Route,
  Switch,
  useParams,
  useRouteMatch,
} from 'react-router-dom';
import { useMetrics } from '@cognite/metrics';
import { PriceScenariosContainer } from 'pages/PriceScenarios/PriceScenariosContainer';
import { BidMatrixContainer } from 'components/BidMatrix/BidMatrixContainer';
import DayAheadMarketHeaderContainer from 'components/DayAheadMarketHeader/DayAheadMarketHeaderContainer';
import SidebarContainer from 'components/Sidebar/SidebarContainer';
import { NewDayAheadDataAvailableBar } from 'components/NewDayAheadDataAvailableBar/NewDayAheadDataAvailableBar';
import { ShopQualityAssuranceModal } from 'components/ShopQualityAssuranceModal/ShopQualityAssuranceModal';
import { useNewBidMatrixAvailable } from 'hooks/useNewBidMatrixAvailable';
import { BaseContainer } from 'styles/layout';

import { Container, MainDiv } from './elements';

export const PriceArea = () => {
  const { path } = useRouteMatch();
  const metrics = useMetrics('bid-matrix');

  const { priceAreaExternalId } = useParams<{
    priceAreaExternalId: string;
  }>();

  const [sidePanelOpen, setSidePanelOpen] = useState(true);

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
    <BaseContainer data-testid="pricearea-page">
      <DayAheadMarketHeaderContainer
        bidProcessEventExternalId={bidProcessEventExternalId}
        onChangeBidProcessEventExternalId={setBidProcessEventExternalId}
      />
      {newMatrixAvailable && (
        <NewDayAheadDataAvailableBar onReloadClick={handleReloadClick} />
      )}
      <ShopQualityAssuranceModal
        bidProcessEventExternalId={bidProcessEventExternalId}
      />
      <Container>
        <SidebarContainer
          bidProcessEventExternalId={bidProcessEventExternalId}
          open={sidePanelOpen}
          onOpenClose={setSidePanelOpen}
        />
        <MainDiv sidePanelOpen={sidePanelOpen}>
          <Switch>
            <Route path={`${path}/price-scenarios`}>
              <PriceScenariosContainer
                bidProcessEventExternalId={bidProcessEventExternalId}
              />
            </Route>
            <Route path={`${path}/:plantExternalId`}>
              <BidMatrixContainer
                bidProcessEventExternalId={bidProcessEventExternalId}
              />
            </Route>
            <Redirect from={path} to={`${path}/total`} />
          </Switch>
        </MainDiv>
      </Container>
    </BaseContainer>
  );
};
