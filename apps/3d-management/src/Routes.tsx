import React from 'react';
import { Route, RouteComponentProps, Switch } from 'react-router-dom';
import NotFound from 'src/pages/NotFound';
import { LazyWrapper } from 'src/components/LazyWrapper';
import { getFlow } from '@cognite/cdf-sdk-singleton';
import { usePermissions } from '@cognite/sdk-react-query-hooks';
import { Loader } from '@cognite/cogs.js';
import NoAccessPage from './pages/NoAccessPage';

function routeWrapper(
  Component: any
): (routerProps: RouteComponentProps) => any {
  return (routeProps: RouteComponentProps) => {
    return <Component {...routeProps} />;
  };
}

const routes = [
  {
    exact: true,
    path: '/:tenant/3d-models',
    component: (props) =>
      LazyWrapper(
        props,
        () => import('src/pages/AllModels' /* webpackChunkName: "3d_models"  */)
      ),
  },
  {
    exact: true,
    path: '/:tenant/3d-models/:modelId/revisions/:revisionId',
    component: (props) =>
      LazyWrapper(
        props,
        () =>
          import(
            'src/pages/RevisionDetails' /* webpackChunkName: "3d_revisions"  */
          )
      ),
  },
];

export function Routes() {
  const { flow } = getFlow();
  const {
    data: threedRead,
    isFetched: threedReadFetched,
    error: threedReadError,
  } = usePermissions(flow, 'threedAcl', 'READ');

  if (threedReadError) {
    return <p>Error retrieving permissions</p>;
  }
  if (!threedReadFetched) {
    return <Loader />;
  }

  if (!threedRead) {
    return <NoAccessPage />;
  }

  return (
    <Switch>
      {routes.map((r) => (
        <Route
          key={r.path}
          exact={r.exact}
          path={r.path}
          component={routeWrapper(r.component)}
        />
      ))}

      <Route component={NotFound} />
    </Switch>
  );
}
