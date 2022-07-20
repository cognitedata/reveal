import React, { Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
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
const Exploration = React.lazy(
  () =>
    import(
      'app/containers/Exploration'
      /* webpackChunkName: "pnid_exploration" */
    )
);

export default function App() {
  const sdk = useSDK();
  const { flow } = getFlow();
  const { data: userInfo } = useUserInformation();

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
                overrideURLMap={{
                  pdfjsWorkerSrc:
                    '/dependencies/pdfjs-dist@2.6.347/build/pdf.worker.min.js',
                }}
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
