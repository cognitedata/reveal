import React, { useEffect } from 'react';
import { Route, Switch, useHistory } from 'react-router-dom';
import Home from 'pages/Home';
import PageLayout from 'pages/PageLayout';
import SuiteOverview from 'pages/SuiteOverview';
import { useIntercom } from 'react-use-intercom';

const Routes = (): JSX.Element => {
  const history = useHistory();
  const { update: updateIntercom } = useIntercom();
  useEffect(() => {
    history.listen(() => {
      updateIntercom();
    });
  }, [history, updateIntercom]);
  return (
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
};

export default Routes;
