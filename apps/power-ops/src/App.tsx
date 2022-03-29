import GlobalStyles from 'global-styles';
import { Switch, Redirect, Route } from 'react-router-dom';
import { Container, Logout } from '@cognite/react-container';
import sidecar from 'utils/sidecar';
import { Providers } from 'providers/appProvider';
import Events from 'pages/Events';
import Demo from 'pages/Demo';
import Portfolio from 'pages/Portfolio';
import { MenuBar, PAGES } from 'pages/Menubar';
import NotFoundPage from 'pages/Error404';
import { EventProvider } from 'providers/EDAProvider';

const App = () => (
  <Providers>
    <Container sidecar={sidecar}>
      <EventProvider>
        <GlobalStyles />
        <MenuBar />

        <Switch>
          <Route path={PAGES.EVENTS} render={() => <Events />} />
          <Route path={PAGES.DEMO} render={() => <Demo />} />
          <Route path={PAGES.PORTFOLIO} render={() => <Portfolio />} />
          <Route path={PAGES.LOGOUT} render={() => <Logout />} />
          <Redirect from="" to={PAGES.DEMO} />
          <Redirect from="/" to={PAGES.DEMO} />
          <Route render={() => <NotFoundPage />} />
        </Switch>
      </EventProvider>
    </Container>
  </Providers>
);

export default App;
