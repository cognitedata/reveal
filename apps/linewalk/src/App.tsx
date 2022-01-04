import GlobalStyles from 'global-styles';
import { Switch, Redirect, Route } from 'react-router-dom';
import { Container } from '@cognite/react-container';
import sidecar from 'utils/sidecar';
import { MenuBar, PagePath } from 'pages/Menubar';
import NotFoundPage from 'pages/Error404';
import { ProvideMixpanel } from 'components/ProvideMixpanel';
import LineReviews from 'pages/LineReviews';
import LineReview from 'pages/LineReview';
import ScarletEquipment from 'pages/ScarletEquipment';

const App = () => (
  <Container sidecar={sidecar as any}>
    <>
      <GlobalStyles />
      <ProvideMixpanel />
      <MenuBar />
      <div style={{ height: 'calc(100vh - 56px)' }}>
        <Switch>
          <Route path={PagePath.LINE_REVIEWS} render={() => <LineReviews />} />
          <Route path={PagePath.LINE_REVIEW} render={() => <LineReview />} />
          <Route
            path={PagePath.SCARLET_EQUIPMENT}
            render={() => <ScarletEquipment />}
          />
          <Redirect
            from={PagePath.SCARLET}
            to={PagePath.SCARLET_EQUIPMENT.replace(
              ':unitName',
              'G0040'
            ).replace(':equipmentName', '95-NH20')}
          />
          <Redirect from="" to={PagePath.LINE_REVIEWS} />
          <Redirect from="/" to={PagePath.LINE_REVIEWS} />
          <Route render={() => <NotFoundPage />} />
        </Switch>
      </div>
    </>
  </Container>
);

export default App;
