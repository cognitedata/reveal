import React, { useEffect } from 'react';
import { Route, Switch, useHistory } from 'react-router-dom';
import Home from 'pages/Home';
import PageLayout from 'pages/PageLayout';
import SuiteOverview from 'pages/SuiteOverview';
import { intercomUpdate } from 'utils/intercom';

const Routes = (): JSX.Element => {
  const history = useHistory();
  useEffect(() => {
    history.listen(() => {
      intercomUpdate();
    });
  }, [history]);
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
