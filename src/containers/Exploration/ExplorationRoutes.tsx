import React from 'react';
import { Switch, Route, useRouteMatch } from 'react-router-dom';
import { Explorer } from './Explorer';

export default function ExplorationRoutes() {
  const match = useRouteMatch();

  return (
    <>
      <Switch>
        <Route path={`${match.path}/:fileId?`} component={Explorer} />
      </Switch>
    </>
  );
}
