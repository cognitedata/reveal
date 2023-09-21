import React, { Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';

import { Loader } from '@data-exploration/components';

import { getFlow } from '@cognite/cdf-sdk-singleton';
import {
  FileContextualizationContextProvider,
  DataExplorationProvider,
  Flow,
} from '@cognite/data-exploration';
import { useSDK } from '@cognite/sdk-provider';

import { ids } from '../../../cogs-variables';
import { ResourceActionsProvider } from '../../context/ResourceActionsContext';
import { ResourceSelectionProvider } from '../../context/ResourceSelectionContext';
import {
  useFlagAdvancedFilters,
  useFlagDocumentsApiEnabled,
} from '../../hooks';
import { useUserInformation } from '../../hooks/hooks';
import { trackUsage } from '../../utils/Metrics';

const Spinner = () => <Loader />;
const Exploration = React.lazy(
  () =>
    import(
      '../Exploration'
      /* webpackChunkName: "pnid_exploration" */
    )
);

export default function App({ useInShell = false }: { useInShell?: boolean }) {
  const sdk = useSDK();
  const { flow } = getFlow();
  const { data: userInfo } = useUserInformation();
  const isAdvancedFiltersEnabled = useFlagAdvancedFilters();
  const isDocumentsApiEnabled = useFlagDocumentsApiEnabled();

  return (
    <Suspense fallback={<Spinner />}>
      <FileContextualizationContextProvider>
        <ResourceSelectionProvider allowEdit mode="none">
          <ResourceActionsProvider>
            <DataExplorationProvider
              flow={flow as Flow}
              sdk={sdk}
              userInfo={userInfo}
              styleScopeId={ids.styleScope}
              overrideURLMap={{
                pdfjsWorkerSrc:
                  '/dependencies/pdfjs-dist@2.6.347/build/pdf.worker.min.js',
              }}
              trackUsage={trackUsage}
              isAdvancedFiltersEnabled={isAdvancedFiltersEnabled}
              isDocumentsApiEnabled={isDocumentsApiEnabled}
            >
              {useInShell ? (
                <Exploration />
              ) : (
                <Routes>
                  <Route path="/explore/*" element={<Exploration />} />
                </Routes>
              )}
            </DataExplorationProvider>
          </ResourceActionsProvider>
        </ResourceSelectionProvider>
      </FileContextualizationContextProvider>
    </Suspense>
  );
}
