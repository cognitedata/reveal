import React, { useEffect } from 'react';
import { Route, RouteProps, Switch, useHistory } from 'react-router-dom';
import useMetrics from 'hooks/useMetrics';

import ChartList from 'pages/ChartList';
import ChartView from 'pages/ChartView';
import { FileView } from 'pages/FileView';
import TopBar from 'components/TopBar';
import PageLayout from 'components/Layout/PageLayout';

const RouteWithTopbar = ({ component, ...rest }: RouteProps) => {
  const Component = component as React.ComponentClass;
  return (
    <Route
      {...rest}
      render={(routeProps) => {
        return (
          <PageLayout>
            <TopBar />
            <main>
              <Component {...routeProps} />
            </main>
          </PageLayout>
        );
      }}
    />
  );
};

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
      <RouteWithTopbar path="/" exact component={ChartList} />
      <RouteWithTopbar path="/:chartId" exact component={ChartView} />
      <RouteWithTopbar path="/:chartId/files/:assetId" component={FileView} />
    </Switch>
  );
};

export default Routes;
