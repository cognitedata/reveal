import { Switch, Route, Redirect } from 'react-router-dom';
import { mainPages } from 'configs/navigation';
import sidecar from 'configs/sidecar';
import GlobalStyles from 'global-styles';
import { Loader, ToastContainer } from '@cognite/cogs.js';
import { AuthConsumer, Container } from '@cognite/react-container';
import { storage } from '@cognite/storage';

import MainHeader from './components/Organisms/MainHeader';
import { ApiProvider } from './contexts/ApiContext';
import { APIErrorProvider } from './contexts/APIErrorContext';
import { Content, Layout, Main } from './elements';
import Configurations from './pages/Configurations';
import New from './pages/Configurations/pages/New';
import DataTransfers from './pages/DataTransfers';
import Status from './pages/Status';

storage.init({ appName: 'cognuit' });

const App = () => {
  return (
    <Container sidecar={sidecar}>
      <GlobalStyles />
      <ApiProvider>
        <APIErrorProvider>
          <Layout>
            <Main>
              <ToastContainer />
              <MainHeader />
              <Content>
                <AuthConsumer>
                  {({ authState }) => {
                    if (!authState || !authState.authenticated) {
                      return <Loader darkMode={false} />;
                    }

                    return (
                      <Switch>
                        <Route exact path="/">
                          {/* <Home /> */}
                          <Redirect to={mainPages.configurations.url} />
                        </Route>
                        <Route exact path={mainPages.configurations.url}>
                          <Configurations />
                        </Route>
                        <Route exact path={mainPages.configurations.pages.new}>
                          <New />
                        </Route>
                        <Route exact path={mainPages.dataTransfers.url}>
                          <DataTransfers />
                        </Route>
                        <Route exact path={mainPages.status.url}>
                          <Status />
                        </Route>
                        <Redirect from="*" to="/" />
                      </Switch>
                    );
                  }}
                </AuthConsumer>
              </Content>
            </Main>
          </Layout>
        </APIErrorProvider>
      </ApiProvider>
    </Container>
  );
};

export default App;
