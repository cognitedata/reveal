import GlobalStyles from 'global-styles';
import { Switch, Redirect, Route } from 'react-router-dom';
import {
  AuthConsumer,
  AuthContext,
  Container,
  Logout,
} from '@cognite/react-container';
import sidecar from 'utils/sidecar';
import { EventStreamProvider } from 'providers/eventStreamProvider';
import { PriceAreaProvider } from 'providers/priceAreaProvider';
import { Providers } from 'providers/appProvider';
import { Portfolio } from 'pages/Portfolio';
import { MenuBar, PAGES } from 'pages/Menubar';
import NotFoundPage from 'pages/Error404';
import { Processes } from 'pages/Processes';
import Monitoring from 'pages/Monitoring/Monitoring';

const App = () => (
  <Providers>
    <Container sidecar={sidecar}>
      <EventStreamProvider>
        <GlobalStyles />
        <AuthConsumer>
          {({ client, authState }: AuthContext) =>
            client && authState ? (
              <PriceAreaProvider client={client} authState={authState}>
                <MenuBar />
                <Switch>
                  <Route path={PAGES.LOGOUT} render={() => <Logout />} />
                  <Route
                    path={PAGES.MONITORING}
                    render={() => <Monitoring />}
                  />
                  <Route path={PAGES.PROCESSES} render={() => <Processes />} />
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
            ) : null
          }
        </AuthConsumer>
      </EventStreamProvider>
    </Container>
  </Providers>
);

export default App;
