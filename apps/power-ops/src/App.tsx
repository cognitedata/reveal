import { Route, Switch, Redirect } from 'react-router-dom';
import { Container, Logout } from '@cognite/react-container';
import GlobalStyles from 'global-styles';
import sidecar from 'utils/sidecar';
import { MenuBar } from 'components/MenuBar/MenuBar';
import { EventStreamProvider } from 'providers/eventStreamProvider';
import { PAGES } from 'types';
import { PriceArea } from 'pages/PriceArea';
import { BalancingMarkets } from 'pages/BalancingMarkets';
import { NotFoundPage } from 'pages/NotFound/NotFound';
import { Workflows, WorkflowSingle } from 'pages/Workflows';
import { Monitoring } from 'pages/Monitoring';
import { DayAheadMarket } from 'pages/DayAheadMarket';
import { WorkflowSchemasContainer } from 'pages/WorkflowSchemas';
import { RKOM } from 'pages/RKOM';

const App = () => (
  <Container sidecar={sidecar}>
    <>
      <GlobalStyles />
      <EventStreamProvider>
        <MenuBar />
        <Switch>
          <Route path={PAGES.PRICE_AREA} component={PriceArea} />
          <Route path={PAGES.PORTFOLIO} component={DayAheadMarket} />
          <Route path={PAGES.DAY_AHEAD_MARKET} component={DayAheadMarket} />
          <Route path={PAGES.RKOM_BID} component={RKOM} />
          <Route path={PAGES.RKOM_PERFORMANCE} component={RKOM} />
          <Route path={PAGES.BALANCING_MARKETS} component={BalancingMarkets} />
          <Route path={PAGES.WORKFLOWS_SINGLE} component={WorkflowSingle} />
          <Route path={PAGES.WORKFLOWS} component={Workflows} />
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
      </EventStreamProvider>
    </>
  </Container>
);

export default App;
