import GlobalStyles from 'global-styles';
import { Switch, Redirect, Route } from 'react-router-dom';
import { Container, Logout } from '@cognite/react-container';
import sidecar from 'utils/sidecar';
import Homepage from 'pages/Homepage';
import { MenuBar, PAGES } from 'pages/Menubar';
import NotFoundPage from 'pages/Error404';

const App = () => (
  <Container sidecar={sidecar}>
    <>
      <GlobalStyles />
      <MenuBar />
      <Switch>
        <Route path={PAGES.HOMEPAGE} component={Homepage} />
        <Route path={PAGES.LOGOUT} render={() => <Logout />} />
        <Redirect from="" to={PAGES.HOMEPAGE} />
        <Redirect from="/" to={PAGES.HOMEPAGE} />
        <Route render={() => <NotFoundPage />} />
      </Switch>
    </>
  </Container>
);

export default App;
