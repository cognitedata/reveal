import React, { useContext, useEffect } from 'react';
import GlobalStyles from 'global-styles';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import { Loader } from '@cognite/cogs.js';
import Home from 'pages/Home';
import { SIDECAR } from 'utils/sidecar';
import Configurations from './pages/Configurations';
import DataTransfers from './pages/DataTransfers';
import Status from './pages/Status';
import { Content, Layout, LoaderBg, Main } from './elements';
import MainHeader from './components/Organisms/MainHeader';
import New from './pages/Configurations/New';
import AuthContext from './contexts/AuthContext';
import sdk from './utils/cognitesdk';

const App = () => {
  const { user, setUser, setAuthenticating, authenticating } = useContext(
    AuthContext
  );
  useEffect(() => {
    if (!user || user.length <= 0) {
      (async () => {
        setAuthenticating(true);
        const status = await sdk.login.status();
        if (status && status.user) {
          setUser(status.user);
        }
        setTimeout(() => {
          setAuthenticating(false);
        }, 2000);
      })();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <>
      <GlobalStyles />
      <Router basename={`/${SIDECAR.cognuitCdfProject}`}>
        <Layout>
          <Main>
            <MainHeader user={user} />
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
        {authenticating && (
          <LoaderBg>
            <Loader darkMode />
          </LoaderBg>
        )}
      </Router>
    </>
  );
};

export default App;
