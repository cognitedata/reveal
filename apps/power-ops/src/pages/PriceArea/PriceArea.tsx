import { useState } from 'react';
import { Redirect, Route, Switch, useRouteMatch } from 'react-router-dom';
import { BaseContainer } from 'styles/layout';
import { BidMatrixContainer } from 'components/BidMatrix/BidMatrixContainer';
import PortfolioHeaderContainer from 'components/PortfolioHeader/PortfolioHeaderContainer';
import SidebarContainer from 'components/Sidebar/SidebarContainer';
import { Loader } from '@cognite/cogs.js';
import { PriceScenariosContainer } from 'pages/PriceScenarios/PriceScenariosContainer';

import { Container, MainDiv } from './elements';

export const PriceArea = () => {
  const { path } = useRouteMatch();
  const [bidProcessEventExternalId, setBidProcessEventExternalId] =
    useState('');
  const [sidePanelOpen, setSidePanelOpen] = useState(true);

  return (
    <BaseContainer>
      <PortfolioHeaderContainer
        bidProcessEventExternalId={bidProcessEventExternalId}
        onChangeBidProcessEventExternalId={setBidProcessEventExternalId}
      />
      {bidProcessEventExternalId === '' ? (
        <Loader infoTitle="Loading Bid Process" />
      ) : (
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
      )}
    </BaseContainer>
  );
};
