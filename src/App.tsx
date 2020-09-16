import React from 'react';
import GlobalStyles from 'global-styles';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import Home from 'pages/Home';
import { SIDECAR } from 'utils/sidecar';
import Configurations from './pages/Configurations';
import DataTransfers from './pages/DataTransfers';
import Status from './pages/Status';
import { Content, Layout, Main } from './elements';
import MainHeader from './components/Organisms/MainHeader';
import New from './pages/Configurations/New';

const App = () => {
  return (
    <>
      <GlobalStyles />
      <Router basename={`/${SIDECAR.cognuitCdfProject}`}>
        <Layout>
          <Main>
            <MainHeader />
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
      </Router>
    </>
  );
};

export default App;
