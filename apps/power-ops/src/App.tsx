import GlobalStyles from 'global-styles';
import { Switch, Redirect, Route } from 'react-router-dom';
import { Container, Logout } from '@cognite/react-container';
import sidecar from 'utils/sidecar';
import { Providers } from 'providers/appProvider';
import Processes from 'pages/Processes';
import Portfolio from 'pages/Portfolio';
import { MenuBar, PAGES } from 'pages/Menubar';
import NotFoundPage from 'pages/Error404';
import { EventProvider } from 'providers/EDAProvider';
import Monitoring from 'pages/Monitoring/Monitoring';

const App = () => (
  <Providers>
    <Container sidecar={sidecar}>
      <EventProvider>
        <GlobalStyles />
        <MenuBar />

        <Switch>
          <Route path={PAGES.MONITORING} render={() => <Monitoring />} />
          <Route path={PAGES.PROCESSES} render={() => <Processes />} />
          <Route path={PAGES.PORTFOLIO} render={() => <Portfolio />} />
          <Route path={PAGES.LOGOUT} render={() => <Logout />} />
          <Redirect from="" to={PAGES.PORTFOLIO} />
          <Redirect from="/" to={PAGES.PORTFOLIO} />
          <Route render={() => <NotFoundPage />} />
        </Switch>
      </EventProvider>
    </Container>
  </Providers>
);

export default App;
