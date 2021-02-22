import React, { useMemo, Suspense } from 'react';
import { Route, Switch, Redirect, useLocation } from 'react-router';
import {
  Loader,
  FileContextualizationContextProvider,
} from '@cognite/data-exploration';
import { ResourceActionsProvider } from 'app/context/ResourceActionsContext';
import { ResourceSelectionProvider } from 'app/context/ResourceSelectionContext';

import { DateRangeProvider } from 'app/context/DateRangeContext';

const Spinner = () => <Loader />;

export default function App() {
  const { pathname, search, hash } = useLocation();

  return (
    <Suspense fallback={<Spinner />}>
      <FileContextualizationContextProvider>
        <ResourceSelectionProvider allowEdit mode="multiple">
          <ResourceActionsProvider>
            <DateRangeProvider>
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
            </DateRangeProvider>
          </ResourceActionsProvider>
        </ResourceSelectionProvider>
      </FileContextualizationContextProvider>
    </Suspense>
  );
}
