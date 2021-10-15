import GlobalStyles from 'global-styles';
import { Switch, Redirect, Route } from 'react-router-dom';
import { Container } from '@cognite/react-container';
import sidecar from 'utils/sidecar';
import { PAGES } from 'pages/Menubar';
import NotFoundPage from 'pages/Error404';
import { OrnateWrapper } from 'pages/Ornate/OrnateWrapper';
import { ProvideMixpanel } from 'components/ProvideMixpanel';

const App = () => (
  <Container sidecar={sidecar as any}>
    <>
      <GlobalStyles />
      <ProvideMixpanel />
      <Switch>
        <Route path={PAGES.HOME} render={() => <OrnateWrapper />} />
        <Redirect from="" to={PAGES.HOME} />
        <Redirect from="/" to={PAGES.HOME} />
        <Route render={() => <NotFoundPage />} />
      </Switch>
    </>
  </Container>
);

export default App;
