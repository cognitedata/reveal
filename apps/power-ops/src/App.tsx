import GlobalStyles from 'global-styles';
import { Route, Switch, Redirect } from 'react-router-dom';
import { Container, Logout } from '@cognite/react-container';
// UTILS
import sidecar from 'utils/sidecar';
// PROVIDERS
import { EventStreamProvider } from 'providers/eventStreamProvider';
import { PriceAreaProvider } from 'providers/priceAreaProvider';
// PAGES
import { Portfolio } from 'pages/Portfolio';
import { MenuBar } from 'components/Menubar/Menubar';
import { NotFoundPage } from 'pages/NotFound/NotFound';
import { Workflows, WorkflowSingle } from 'pages/Workflows';
import { Monitoring } from 'pages/Monitoring';

export enum PAGES {
  HOME = '/home',
  WORKFLOWS = '/workflows',
  WORKFLOWS_SINGLE = '/workflows/:workflowExternalId',
  MONITORING = '/monitoring',
  PORTFOLIO = '/portfolio',
  LOGOUT = '/logout',
}

const App = () => (
  <Container sidecar={sidecar}>
    <>
      <GlobalStyles />
      <EventStreamProvider>
        <PriceAreaProvider>
          <MenuBar />
          <Switch>
            <Route path={PAGES.LOGOUT} component={Logout} />
            <Route path={PAGES.MONITORING} component={Monitoring} />
            <Route exact path={PAGES.WORKFLOWS} component={Workflows} />
            <Route path={PAGES.WORKFLOWS_SINGLE} component={WorkflowSingle} />
            <Route
              path={[
                `${PAGES.PORTFOLIO}/:priceAreaExternalId`,
                `${PAGES.PORTFOLIO}`,
              ]}
              component={Portfolio}
            />
            <Redirect from="" to={PAGES.PORTFOLIO} />
            <Redirect from="/" to={PAGES.PORTFOLIO} />
            <Route component={NotFoundPage} />
          </Switch>
        </PriceAreaProvider>
      </EventStreamProvider>
    </>
  </Container>
);

export default App;
