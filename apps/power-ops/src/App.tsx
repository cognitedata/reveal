import GlobalStyles from 'global-styles';
import { Switch, Redirect, Route } from 'react-router-dom';
import { Container, Logout } from '@cognite/react-container';
import sidecar from 'utils/sidecar';
import { Providers } from 'providers/appProvider';
import Home from 'pages/Home';
import Historical from 'pages/Historical';
import { MenuBar, PAGES } from 'pages/Menubar';
import NotFoundPage from 'pages/Error404';

const App = () => (
  <Providers>
    <Container sidecar={sidecar}>
      <>
        <GlobalStyles />
        <MenuBar />

        <Switch>
          <Route path={PAGES.HOME} render={() => <Home />} />
          <Route path={PAGES.HISTORICAL} render={() => <Historical />} />
          <Route path={PAGES.LOGOUT} render={() => <Logout />} />
          <Redirect from="" to={PAGES.HOME} />
          <Redirect from="/" to={PAGES.HOME} />
          <Route render={() => <NotFoundPage />} />
        </Switch>
      </>
    </Container>
  </Providers>
);

export default App;
