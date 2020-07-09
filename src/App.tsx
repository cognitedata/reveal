import React from 'react';
import GlobalStyles from 'global-styles';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import Home from 'pages/Home';
import Configurations from './pages/Configurations';
import Translations from './pages/Translations';
import Status from './pages/Status';
import { Content, Layout, Main } from './elements';
import MainHeader from './components/Organisms/MainHeader';

const App = () => {
  return (
    <>
      <GlobalStyles />
      <Router basename="/cwp">
        <Layout>
          <Main>
            <MainHeader />
            <Content>
              <Switch>
                <Route exact path="/">
                  <Home />
                </Route>
                <Route path="/configurations">
                  <Configurations />
                </Route>
                <Route path="/translations">
                  <Translations />
                </Route>
                <Route path="/status">
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
