import React from 'react';
import { Route, Switch } from 'react-router-dom';
import Home from 'pages/Home';
import PageLayout from 'pages/PageLayout';

const Routes = (): JSX.Element => (
  <PageLayout>
    <Switch>
      <Route path="/">
        <Home />
      </Route>
    </Switch>
  </PageLayout>
);

export default Routes;
