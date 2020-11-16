import React, { useEffect } from 'react';
import { Route, Switch, useHistory } from 'react-router-dom';
import useMetrics from 'hooks/useMetrics';

import ChartList from 'pages/ChartList';
import ChartView from 'pages/ChartView';

const Routes = () => {
  const metrics = useMetrics('Routes');
  const history = useHistory();

  useEffect(() => {
    history.listen((location) => {
      metrics.track('Page view', { pathname: location.pathname });
    });
  }, []);

  return (
    <Switch>
      <Route path="/" exact component={ChartList} />
      <Route path="/:chartId" exact component={ChartView} />
    </Switch>
  );
};

export default Routes;
