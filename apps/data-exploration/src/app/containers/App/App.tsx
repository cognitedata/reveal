import React, { Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import { ids } from '../../../cogs-variables';
import {
  Loader,
  FileContextualizationContextProvider,
  DataExplorationProvider,
} from '@cognite/data-exploration';
import { ResourceActionsProvider } from '@data-exploration-app/context/ResourceActionsContext';
import { ResourceSelectionProvider } from '@data-exploration-app/context/ResourceSelectionContext';

import { DateRangeProvider } from '@data-exploration-app/context/DateRangeContext';
import { useSDK } from '@cognite/sdk-provider';
import { getFlow } from '@cognite/cdf-sdk-singleton';
import { useUserInformation } from '@data-exploration-app/hooks/hooks';
import { trackUsage } from '@data-exploration-app/utils/Metrics';
import { useFlagAdvancedFilters } from '@data-exploration-app/hooks';

const Spinner = () => <Loader />;
const Exploration = React.lazy(
  () =>
    import(
      '@data-exploration-app/containers/Exploration'
      /* webpackChunkName: "pnid_exploration" */
    )
);

export default function App() {
  const sdk = useSDK();
  const { flow } = getFlow();
  const { data: userInfo } = useUserInformation();
  const isAdvancedFiltersEnabled = useFlagAdvancedFilters();

  return (
    <Suspense fallback={<Spinner />}>
      <FileContextualizationContextProvider>
        <ResourceSelectionProvider allowEdit mode="none">
          <ResourceActionsProvider>
            <DateRangeProvider>
              <DataExplorationProvider
                flow={flow}
                sdk={sdk}
                userInfo={userInfo}
                styleScopeId={ids.styleScope}
                overrideURLMap={{
                  pdfjsWorkerSrc:
                    '/dependencies/pdfjs-dist@2.6.347/build/pdf.worker.min.js',
                }}
                trackUsage={trackUsage}
                isAdvancedFiltersEnabled={isAdvancedFiltersEnabled}
              >
                <Routes>
                  <Route path="/explore/*" element={<Exploration />} />
                </Routes>
              </DataExplorationProvider>
            </DateRangeProvider>
          </ResourceActionsProvider>
        </ResourceSelectionProvider>
      </FileContextualizationContextProvider>
    </Suspense>
  );
}
