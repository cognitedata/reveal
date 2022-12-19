import { Route, Switch, Redirect } from 'react-router-dom';
import { Container, Logout } from '@cognite/react-container';
import GlobalStyles from 'global-styles';
import sidecar from 'utils/sidecar';
import { MenuBar } from 'components/MenuBar/MenuBar';
import { EnvironmentInfoBar } from 'components/EnvironmentInfoBar/EnvironmentInfoBar';
import { EventStreamProvider } from 'providers/eventStreamProvider';
import { PAGES } from 'types';
import { PriceArea } from 'pages/PriceArea';
import { BalancingMarkets } from 'pages/BalancingMarkets';
import { NotFoundPage } from 'pages/NotFound/NotFound';
import { WorkflowsContainer } from 'pages/Workflows';
import { WorkflowSingleContainer } from 'pages/WorkflowSingle';
import { Monitoring } from 'pages/Monitoring';
import { DayAheadMarket } from 'pages/DayAheadMarket';
import { WorkflowSchemasContainer } from 'pages/WorkflowSchemas';
import { RKOM } from 'pages/RKOM';
import config from 'utils/config';
import { BaseContainer, VerticalFlexContainer } from 'styles/layout';

const App = () => (
  <Container sidecar={sidecar}>
    <GlobalStyles />
    <EventStreamProvider>
      <BaseContainer>
        {config.env !== 'production' && <EnvironmentInfoBar />}
        <MenuBar />
        <VerticalFlexContainer>
          <Switch>
            <Route path={PAGES.PRICE_AREA} component={PriceArea} />
            <Route path={PAGES.PORTFOLIO} component={DayAheadMarket} />
            <Route path={PAGES.DAY_AHEAD_MARKET} component={DayAheadMarket} />
            <Route path={PAGES.RKOM_BID} component={RKOM} />
            <Route path={PAGES.RKOM_PERFORMANCE} component={RKOM} />
            <Route
              path={PAGES.BALANCING_MARKETS}
              component={BalancingMarkets}
            />
            <Route
              path={PAGES.WORKFLOWS_SINGLE}
              component={WorkflowSingleContainer}
            />
            <Route path={PAGES.WORKFLOWS} component={WorkflowsContainer} />
            <Route
              path={PAGES.WORKFLOW_SCHEMAS}
              component={WorkflowSchemasContainer}
            />
            <Route path={PAGES.MONITORING} component={Monitoring} />
            <Route path={PAGES.LOGOUT} component={Logout} />
            <Redirect from="" to={PAGES.DAY_AHEAD_MARKET} />
            <Redirect from="/" to={PAGES.DAY_AHEAD_MARKET} />
            <Route component={NotFoundPage} />
          </Switch>
        </VerticalFlexContainer>
      </BaseContainer>
    </EventStreamProvider>
  </Container>
);

export default App;
