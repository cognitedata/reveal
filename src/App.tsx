import React, { useEffect } from 'react';
import Home from 'pages/Home';
import { AuthWrapper, SubAppWrapper } from '@cognite/cdf-utilities';
import GlobalStyles from 'styles/GlobalStyles';
import { setupMixpanel } from 'utils/config';
import { createBrowserHistory } from 'history';
import { Route, Router, Switch } from 'react-router-dom';
import cogsStyles from '@cognite/cogs.js/dist/cogs.css';
import Classifier from 'pages/Classifier/Classifiser';
import { ClassifierContext } from 'machines/classifier/contexts/ClassifierContext';
import { SDKProvider } from '@cognite/sdk-provider';
import { Loader } from '@cognite/cogs.js';
import sdk from './sdk-singleton';

setupMixpanel();

const App = () => {
  const project = window.location.pathname.split('/')[1];
  const history = createBrowserHistory();

  if (!project) {
    throw new Error('CDF Project is missing');
  }

  useEffect(() => {
    cogsStyles.use();

    return () => {
      cogsStyles.unuse();
    };
  }, []);

  return (
    // If styles are broken please check: .rescripts#PrefixWrap(
    <GlobalStyles>
      <SubAppWrapper padding={false}>
        <AuthWrapper
          showLoader
          includeGroups
          loadingScreen={<Loader darkMode={false} />}
          subAppName="document-search-ui"
        >
          <SDKProvider sdk={sdk}>
            <ClassifierContext>
              <Router history={history}>
                <Switch>
                  <Route
                    path="/:project/documents/classifier"
                    component={Classifier}
                  />
                  <Route path="/:project/documents" component={Home} />
                </Switch>
              </Router>
            </ClassifierContext>
          </SDKProvider>
        </AuthWrapper>
      </SubAppWrapper>
    </GlobalStyles>
  );
};

export default App;
