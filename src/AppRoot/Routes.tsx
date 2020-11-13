import React from 'react';
import { Route, Switch } from 'react-router-dom';
import Home from 'pages/Home';
import PageLayout from 'pages/PageLayout';
import SuiteOverview from 'pages/SuiteOverview';

const Routes = (): JSX.Element => (
  <PageLayout>
    <Switch>
      <Route exact path="/">
        <Home />
      </Route>
      <Route path="/suites/:id">
        <SuiteOverview />
      </Route>
    </Switch>
  </PageLayout>
);

export default Routes;
