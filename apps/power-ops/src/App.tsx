import GlobalStyles from 'global-styles';
import { Route, Switch, Redirect } from 'react-router-dom';
import {
  AuthConsumer,
  AuthContext,
  Container,
  Logout,
} from '@cognite/react-container';
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
  MONITORING = '/monitoring',
  PORTFOLIO = '/portfolio',
  LOGOUT = '/logout',
}

const App = () => (
  <Container sidecar={sidecar}>
    <>
      <GlobalStyles />
      <AuthConsumer>
        {({ client, authState }: AuthContext) =>
          client && authState ? (
            <EventStreamProvider>
              <PriceAreaProvider client={client} authState={authState}>
                <MenuBar />
                <Switch>
                  <Route path={PAGES.LOGOUT} render={() => <Logout />} />
                  <Route
                    path={PAGES.MONITORING}
                    render={() => <Monitoring />}
                  />
                  <Route
                    exact
                    path={PAGES.WORKFLOWS}
                    render={() => <Workflows />}
                  />
                  <Route
                    path={`${PAGES.WORKFLOWS}/:workflowExternalId`}
                    render={() => (
                      <WorkflowSingle client={client} authState={authState} />
                    )}
                  />
                  <Route
                    path={[
                      `${PAGES.PORTFOLIO}/:priceAreaExternalId`,
                      `${PAGES.PORTFOLIO}`,
                    ]}
                    render={() => <Portfolio />}
                  />
                  <Redirect from="" to={PAGES.PORTFOLIO} />
                  <Redirect from="/" to={PAGES.PORTFOLIO} />
                  <Route render={() => <NotFoundPage />} />
                </Switch>
              </PriceAreaProvider>
            </EventStreamProvider>
          ) : null
        }
      </AuthConsumer>
    </>
  </Container>
);

export default App;
