import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { Router, Route, Switch } from 'react-router-dom';
import { createBrowserHistory } from 'history';
import cogsStyles from '@cognite/cogs.js/dist/cogs.css';
import { AuthWrapper, SubAppWrapper } from '@cognite/cdf-utilities';
import { SDKProvider } from '@cognite/sdk-provider';
import AntStyles from 'components/AntStyles';
import { setupSentry } from 'utils/setupSentry';
import { setupMixpanel } from 'utils/config';
import RootApp from 'pages/App';
import sdk from 'sdk-singleton';
import GlobalStyles from 'styles/GlobalStyles';
import store from './store';

setupMixpanel();

const App = () => {
  const history = createBrowserHistory();

  useEffect(() => {
    cogsStyles.use();
    setupSentry();

    return () => {
      cogsStyles.unuse();
    };
  }, []);

  return (
    // If styles are broken please check: .rescripts#PrefixWrap(
    <AntStyles>
      <GlobalStyles>
        <SubAppWrapper>
          <AuthWrapper subAppName="context-ui-pnid">
            <SDKProvider sdk={sdk}>
              <Provider store={store}>
                <Router history={history}>
                  <Switch>
                    <Route
                      path="/:tenant/pnid_parsing_new"
                      component={RootApp}
                    />
                  </Switch>
                </Router>
              </Provider>
            </SDKProvider>
          </AuthWrapper>
        </SubAppWrapper>
      </GlobalStyles>
    </AntStyles>
  );
};

export default App;
