import React, { Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';

import { Loader } from '@data-exploration/components';
import { ResourceActionsProvider } from '@data-exploration-app/context/ResourceActionsContext';
import { ResourceSelectionProvider } from '@data-exploration-app/context/ResourceSelectionContext';
import { useFlagAdvancedFilters } from '@data-exploration-app/hooks';
import { useUserInformation } from '@data-exploration-app/hooks/hooks';
import { trackUsage } from '@data-exploration-app/utils/Metrics';

import { getFlow } from '@cognite/cdf-sdk-singleton';
import {
  FileContextualizationContextProvider,
  DataExplorationProvider,
} from '@cognite/data-exploration';
import { useSDK } from '@cognite/sdk-provider';

import { ids } from '../../../cogs-variables';

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
          </ResourceActionsProvider>
        </ResourceSelectionProvider>
      </FileContextualizationContextProvider>
    </Suspense>
  );
}
