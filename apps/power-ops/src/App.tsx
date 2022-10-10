import GlobalStyles from 'global-styles';
import { Route, Switch, Redirect } from 'react-router-dom';
import { Container, Logout } from '@cognite/react-container';
// UTILS
import sidecar from 'utils/sidecar';
// PROVIDERS
import { EventStreamProvider } from 'providers/eventStreamProvider';
// PAGES
import { PriceArea } from 'pages/PriceArea';
import { MenuBar } from 'components/Menubar/Menubar';
import { NotFoundPage } from 'pages/NotFound/NotFound';
import { Workflows, WorkflowSingle } from 'pages/Workflows';
import { Monitoring } from 'pages/Monitoring';
import { Portfolio } from 'pages/Portfolio';
import { WorkflowSchemasContainer } from 'pages/WorkflowSchemas';

export enum PAGES {
  HOME = '/home',
  MONITORING = '/monitoring',
  WORKFLOWS_SINGLE = '/workflows/:workflowExternalId',
  WORKFLOWS = '/workflows',
  PRICE_AREA = '/portfolio/:priceAreaExternalId',
  PORTFOLIO = '/portfolio',
  WORKFLOW_SCHEMAS = '/workflow-schemas',
  LOGOUT = '/logout',
}

const App = () => (
  <Container sidecar={sidecar}>
    <>
      <GlobalStyles />
      <EventStreamProvider>
        <MenuBar />
        <Switch>
          <Route path={PAGES.LOGOUT} component={Logout} />
          <Route path={PAGES.MONITORING} component={Monitoring} />
          <Route path={PAGES.WORKFLOWS_SINGLE} component={WorkflowSingle} />
          <Route path={PAGES.WORKFLOWS} component={Workflows} />
          <Route path={PAGES.PRICE_AREA} component={PriceArea} />
          <Route path={PAGES.PORTFOLIO} component={Portfolio} />
          <Route
            path={PAGES.WORKFLOW_SCHEMAS}
            component={WorkflowSchemasContainer}
          />
          <Redirect from="" to={PAGES.PORTFOLIO} />
          <Redirect from="/" to={PAGES.PORTFOLIO} />
          <Route component={NotFoundPage} />
        </Switch>
      </EventStreamProvider>
    </>
  </Container>
);

export default App;
