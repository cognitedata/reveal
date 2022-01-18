import React, { useMemo, Suspense } from 'react';
import { Route, Switch, Redirect, useLocation } from 'react-router';
import {
  Loader,
  FileContextualizationContextProvider,
  DataExplorationProvider,
} from '@cognite/data-exploration';
import { ResourceActionsProvider } from 'app/context/ResourceActionsContext';
import { ResourceSelectionProvider } from 'app/context/ResourceSelectionContext';

import { DateRangeProvider } from 'app/context/DateRangeContext';
import { useSDK } from '@cognite/sdk-provider';
import { getFlow } from '@cognite/cdf-sdk-singleton';
import { useUserInformation } from 'app/hooks';

const Spinner = () => <Loader />;

export default function App() {
  const { pathname, search, hash } = useLocation();
  const sdk = useSDK();
  const { flow } = getFlow();
  const { data: userInfo } = useUserInformation();

  return (
    <Suspense fallback={<Spinner />}>
      <FileContextualizationContextProvider>
        <ResourceSelectionProvider allowEdit mode="multiple">
          <ResourceActionsProvider>
            <DateRangeProvider>
              <DataExplorationProvider
                flow={flow}
                sdk={sdk}
                userInfo={userInfo}
                overrideURLMap={{
                  pdfjsWorkerSrc:
                    '/dependencies/pdfjs-dist@2.6.347/build/pdf.worker.min.js',
                }}
              >
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
              </DataExplorationProvider>
            </DateRangeProvider>
          </ResourceActionsProvider>
        </ResourceSelectionProvider>
      </FileContextualizationContextProvider>
    </Suspense>
  );
}
