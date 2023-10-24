import React, { Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';

import { Loader } from '@data-exploration/components';
import { UserHistoryProvider } from '@user-history';

import { getFlow } from '@cognite/cdf-sdk-singleton';
import { getCluster, getProject } from '@cognite/cdf-utilities';
import {
  FileContextualizationContextProvider,
  DataExplorationProvider,
  Flow,
} from '@cognite/data-exploration';
import { useSDK } from '@cognite/sdk-provider';

import { ids } from '../../../cogs-variables';
import { useFlagDocumentsApiEnabled } from '../../hooks';
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
  const { data: userInfo, isFetched } = useUserInformation();
  const isDocumentsApiEnabled = useFlagDocumentsApiEnabled();

  const project = getProject();
  const cluster = getCluster() ?? undefined;
  const userId = userInfo?.id;

  if (!isFetched) {
    return <Loader />;
  }

  return (
    <Suspense fallback={<Spinner />}>
      <UserHistoryProvider cluster={cluster} project={project} userId={userId}>
        <FileContextualizationContextProvider>
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
        </FileContextualizationContextProvider>
      </UserHistoryProvider>
    </Suspense>
  );
}
