import { Switch, Route } from 'react-router-dom';
import { AuthConsumer, Container } from '@cognite/react-container';
import { storage } from '@cognite/storage';
import { Loader, ToastContainer } from '@cognite/cogs.js';
import GlobalStyles from 'global-styles';
import sidecar from 'configs/sidecar';
import Home from 'pages/Home';
import { Providers } from 'Providers';

import Configurations from './pages/Configurations';
import DataTransfers from './pages/DataTransfers';
import Status from './pages/Status';
import { Content, Layout, Main } from './elements';
import MainHeader from './components/Organisms/MainHeader';
import New from './pages/Configurations/pages/New';
import { ApiProvider } from './contexts/ApiContext';
import { APIErrorProvider } from './contexts/APIErrorContext';

storage.init({ appName: 'cognuit' });

const App = () => {
  return (
    <Container sidecar={sidecar}>
      <>
        <GlobalStyles />
        <Providers>
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
                              <Home />
                            </Route>
                            <Route exact path="/configurations">
                              <Configurations />
                            </Route>
                            <Route exact path="/configurations/new/:type">
                              <New />
                            </Route>
                            <Route exact path="/data-transfers">
                              <DataTransfers />
                            </Route>
                            <Route exact path="/status">
                              <Status />
                            </Route>
                          </Switch>
                        );
                      }}
                    </AuthConsumer>
                  </Content>
                </Main>
              </Layout>
            </APIErrorProvider>
          </ApiProvider>
        </Providers>
      </>
    </Container>
  );
};

export default App;
