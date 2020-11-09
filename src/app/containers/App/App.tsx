import React, { useEffect, useMemo, Suspense } from 'react';
import { Metrics } from '@cognite/metrics';
import { Route, Switch, Redirect, useLocation } from 'react-router';
import { Loader } from 'lib/components';
import { ResourceActionsProvider } from 'lib/context/ResourceActionsContext';
import { ResourceSelectionProvider } from 'app/context/ResourceSelectionContext';
import { ResourceSelectionProvider as OldResourceSelectionProvider } from 'lib/context/ResourceSelectionContext';
import { FileContextualizationContextProvider } from 'lib/context/FileContextualization';
import { useUserStatus } from 'lib/hooks/CustomHooks';

const Spinner = () => <Loader />;

export default function App() {
  const { pathname, search, hash } = useLocation();

  const { data: status, isFetched } = useUserStatus();
  const username = isFetched && !!status && status.user;

  useEffect(() => {
    if (username) {
      Metrics.identify(username);
    }
  }, [username]);

  return (
    <Suspense fallback={<Spinner />}>
      <FileContextualizationContextProvider>
        <ResourceSelectionProvider allowEdit>
          <OldResourceSelectionProvider allowEdit>
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
                            'app/containers/Exploration'
                            /* webpackChunkName: "pnid_exploration" */
                          )
                      ),
                    []
                  )}
                />
              </Switch>
            </ResourceActionsProvider>
          </OldResourceSelectionProvider>
        </ResourceSelectionProvider>
      </FileContextualizationContextProvider>
    </Suspense>
  );
}
