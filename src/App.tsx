import React from 'react';
import { Switch, Route } from 'react-router-dom';
import { Container, AuthConsumer, AuthContext } from '@cognite/react-container';

import GlobalStyles from 'global-styles';

import Home from 'pages/Home';
import Configurations from './pages/Configurations';
import DataTransfers from './pages/DataTransfers';
import Status from './pages/Status';
import { Content, Layout, Main } from './elements';
import MainHeader from './components/Organisms/MainHeader';
import New from './pages/Configurations/New';

const App = () => (
  <>
    <GlobalStyles />
    <Container appName="cognuit">
      <AuthConsumer>
        {({ authState }: AuthContext) => (
          <Layout>
            <Main>
              <MainHeader user={authState?.username} />
              <Content>
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
              </Content>
            </Main>
          </Layout>
        )}
      </AuthConsumer>
    </Container>
  </>
);

export default App;
