import { Switch, Redirect, Route } from 'react-router-dom';
import GlobalStyles from 'global-styles';
import sidecar from 'utils/sidecar';
import { Container, Logout } from '@cognite/react-container';
import CogniteSDK from 'pages/CogniteSDK';
import Comments from 'pages/Comments';
import CommentDrawer from 'pages/Comments/CommentDrawerPage';
import CommentSlider from 'pages/Comments/CommentSliderPage';
import NotFoundPage from 'pages/Error404';
import Home from 'pages/Home';
import Info from 'pages/Info';
import Intercom from 'pages/Intercom';
import { MenuBar, PAGES } from 'pages/Menubar';

const App = () => (
  <Container sidecar={sidecar}>
    <>
      <GlobalStyles />
      <MenuBar />

      <Switch>
        <Route path={PAGES.HOME} render={() => <Home />} />
        <Route path={PAGES.INFO} render={() => <Info />} />
        <Route path={PAGES.SDK} render={() => <CogniteSDK />} />
        <Route path={PAGES.INTERCOM} render={() => <Intercom />} />
        <Route path={PAGES.LOGOUT} render={() => <Logout />} />
        <Route path={PAGES.COMMENTS} exact render={() => <Comments />} />
        <Route path={PAGES.COMMENTS_DRAWER} render={() => <CommentDrawer />} />
        <Route path={PAGES.COMMENTS_SLIDER} render={() => <CommentSlider />} />
        <Redirect from="" to={PAGES.HOME} />
        <Redirect from="/" to={PAGES.HOME} />
        <Route render={() => <NotFoundPage />} />
      </Switch>
    </>
  </Container>
);

export default App;
