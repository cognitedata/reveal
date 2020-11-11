import React from 'react';
import GlobalStyles from 'global-styles';

import { I18nContainer } from '@cognite/react-i18n';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';

import PageLayout from 'pages/PageLayout';
import Home from 'pages/Home';

const App = () => {
  return (
    <>
      <GlobalStyles />
      <I18nContainer>
        <Router>
          <PageLayout>
            <Switch>
              <Route path="/">
                <Home />
              </Route>
            </Switch>
          </PageLayout>
        </Router>
      </I18nContainer>
    </>
  );
};

export default App;
