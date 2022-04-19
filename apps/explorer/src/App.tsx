import { Switch, Redirect, Route } from 'react-router-dom';
import GlobalStyles from 'global-styles';
import sidecar from 'utils/sidecar';
import { Container, Logout } from '@cognite/react-container';
import NotFoundPage from 'pages/Error404';
import Home from 'pages/Home';
import { MenuBar, PAGES } from 'pages/Menubar';

const App = () => (
  <Container sidecar={sidecar}>
    <>
      <GlobalStyles />
      <MenuBar />

      <Switch>
        <Route path={PAGES.HOME} render={() => <Home />} />
        <Route path={PAGES.LOGOUT} render={() => <Logout />} />

        <Redirect from="" to={PAGES.HOME} />
        <Redirect from="/" to={PAGES.HOME} />
        <Route render={() => <NotFoundPage />} />
      </Switch>
    </>
  </Container>
);

export default App;
