import React from 'react';
import { Switch, Route } from 'react-router-dom';
import { AuthConsumer, ContainerWithoutI18N } from '@cognite/react-container';
import { Loader } from '@cognite/cogs.js';

import GlobalStyles from 'global-styles';

import Home from 'pages/Home';
import Configurations from './pages/Configurations';
import DataTransfers from './pages/DataTransfers';
import Status from './pages/Status';
import { Content, Layout, Main } from './elements';
import MainHeader from './components/Organisms/MainHeader';
import New from './pages/Configurations/New';
import { ApiProvider } from './contexts/ApiContext';
import { APIErrorProvider } from './contexts/APIErrorContext';

const App = () => (
  <>
    <GlobalStyles />
    <ContainerWithoutI18N disableTranslations>
      <ApiProvider>
        <APIErrorProvider>
          <Layout>
            <Main>
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
    </ContainerWithoutI18N>
  </>
);

export default App;
