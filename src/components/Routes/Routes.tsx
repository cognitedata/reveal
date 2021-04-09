import React, { useEffect } from 'react';
import { Route, Switch, useHistory } from 'react-router-dom';
import useMetrics from 'hooks/useMetrics';

import ChartList from 'pages/ChartList';
import ChartView from 'pages/ChartView';
import { FileView } from 'pages/FileView';

const Routes = () => {
  const metrics = useMetrics('Routes');
  const history = useHistory();

  useEffect(() => {
    return history.listen((location) => {
      metrics.track('Page view', { pathname: location.pathname });
    });
  }, [history, metrics]);

  return (
    <Switch>
      <Route path="/" exact component={ChartList} />
      <Route path="/:chartId" exact component={ChartView} />
      <Route path="/:chartId/files/:assetId" component={FileView} />
    </Switch>
  );
};

export default Routes;
