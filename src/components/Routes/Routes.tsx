import React from 'react';
import { Route, RouteProps, Switch } from 'react-router-dom';

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
  return (
    <Switch>
      <RouteWithTopbar path="/" exact component={ChartList} />
      <RouteWithTopbar path="/:chartId" exact component={ChartView} />
      <RouteWithTopbar path="/:chartId/files/:assetId" component={FileView} />
    </Switch>
  );
};

export default Routes;
