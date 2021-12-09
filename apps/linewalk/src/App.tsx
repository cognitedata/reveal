import GlobalStyles from 'global-styles';
import { Switch, Redirect, Route } from 'react-router-dom';
import { Container } from '@cognite/react-container';
import sidecar from 'utils/sidecar';
import { MenuBar, PagePath } from 'pages/Menubar';
import NotFoundPage from 'pages/Error404';
import { ProvideMixpanel } from 'components/ProvideMixpanel';
import Home from 'pages/Home';
import LineReviews from 'pages/LineReviews';
import LineReview from 'pages/LineReview';

const App = () => (
  <Container sidecar={sidecar as any}>
    <>
      <GlobalStyles />
      <ProvideMixpanel />
      <MenuBar />
      <div style={{ height: 'calc(100vh - 60px)' }}>
        <Switch>
          <Route path={PagePath.HOME} render={() => <Home />} />
          <Route path={PagePath.LINE_REVIEWS} render={() => <LineReviews />} />
          <Route path={PagePath.LINE_REVIEW} render={() => <LineReview />} />
          <Redirect from="" to={PagePath.HOME} />
          <Redirect from="/" to={PagePath.HOME} />
          <Route render={() => <NotFoundPage />} />
        </Switch>
      </div>
    </>
  </Container>
);

export default App;
