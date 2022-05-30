import GlobalStyles from 'global-styles';
import { Switch, Redirect, Route } from 'react-router-dom';
import { Container } from '@cognite/react-container';
import sidecar from 'utils/sidecar';
import { MenuBar, PagePath } from 'pages/Menubar';
import NotFoundPage from 'pages/Error404';
import { ProvideMixpanel } from 'components/ProvideMixpanel';
import LineReviews from 'pages/LineReviews';
import LineReview from 'pages/LineReview';
import { ScarletApp } from 'scarlet/ScarletApp';
import DiagramParserPage from 'pages/DiagramParser';
import SiteContextProvider from 'components/SiteContext/SiteContextProvider';

const App = () => (
  <Container sidecar={sidecar as any}>
    <SiteContextProvider>
      <>
        <GlobalStyles />
        <ProvideMixpanel />

        <MenuBar />
        <div style={{ height: 'calc(100vh - 56px)' }}>
          <Switch>
            <Route
              path={PagePath.LINE_REVIEWS}
              render={() => <LineReviews />}
            />
            <Route path={PagePath.LINE_REVIEW} render={() => <LineReview />} />
            <Route path={PagePath.SCARLET} render={() => <ScarletApp />} />
            <Route
              path={PagePath.DIAGRAM_PARSER}
              render={() => <DiagramParserPage />}
            />
            <Redirect from="" to={PagePath.LINE_REVIEWS} />
            <Redirect from="/" to={PagePath.LINE_REVIEWS} />
            <Route render={() => <NotFoundPage />} />
          </Switch>
        </div>
      </>
    </SiteContextProvider>
  </Container>
);

export default App;
