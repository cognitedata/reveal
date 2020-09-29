import React, { useEffect, useMemo, Suspense } from 'react';
import {
  useResourcesDispatch,
  useResourcesSelector,
} from '@cognite/cdf-resources-store';
import { init, setCdfEnv, selectUserName } from 'modules/app';
import queryString from 'query-string';
import { Metrics } from '@cognite/metrics';
import { useRouteMatch, useHistory } from 'react-router-dom';
import { RootState } from 'reducers';
import { Route, Switch, Redirect, useLocation } from 'react-router';
import { Loader } from 'components/Common';
import { ResourceActionsProvider } from 'context/ResourceActionsContext';
import { ResourceSelectionProvider } from 'context/ResourceSelectionContext';

const Spinner = () => <Loader />;

export default function App() {
  const dispatch = useResourcesDispatch();
  const history = useHistory();
  const { pathname, search, hash } = useLocation();
  const { location } = history;

  const {
    params: { tenant: pathTenant },
  } = useRouteMatch<{ tenant: string }>();
  const cdfEnv = queryString.parse(window.location.search).env as string;
  const username = useResourcesSelector(selectUserName);

  useEffect(() => {
    dispatch(init(pathTenant));
  }, [dispatch, pathTenant]);

  useEffect(() => {
    dispatch(setCdfEnv(cdfEnv));
  }, [dispatch, cdfEnv]);

  const storeCdfEnv = useResourcesSelector(
    (state: RootState) => state.app.cdfEnv
  );

  useEffect(() => {
    if (storeCdfEnv && !cdfEnv) {
      // if env is not visible via URL add it in
      history.replace({
        pathname: location.pathname,
        search: `?env=${storeCdfEnv}`,
      });
    }
  }, [cdfEnv, storeCdfEnv, history, location.pathname]);

  useEffect(() => {
    if (username) {
      Metrics.identify(username);
    }
  }, [username]);

  return (
    <Suspense fallback={<Spinner />}>
      <ResourceSelectionProvider allowEdit>
        <ResourceActionsProvider>
          <Switch>
            <Redirect
              from="/:url*(/+)"
              to={{
                pathname: pathname.slice(0, -1),
                search,
                hash,
              }}
            />
            <Route
              key="/:tenant/explore"
              path="/:tenant/explore"
              component={useMemo(
                () =>
                  React.lazy(
                    () =>
                      import(
                        'containers/Exploration'
                        /* webpackChunkName: "pnid_exploration" */
                      )
                  ),
                []
              )}
            />
          </Switch>
        </ResourceActionsProvider>
      </ResourceSelectionProvider>
    </Suspense>
  );
}
