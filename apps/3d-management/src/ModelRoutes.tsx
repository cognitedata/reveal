import React, { lazy } from 'react';
import { Route, Routes } from 'react-router-dom';
import { getFlow } from '@cognite/cdf-sdk-singleton';
import { usePermissions } from '@cognite/sdk-react-query-hooks';
import { Loader } from '@cognite/cogs.js';
import { FallbackWrapper } from 'components/FallbackWrapper';

// lazy loads
const AllModels = lazy(() => import('pages/AllModels'));
const RevisionDetails = lazy(() => import('pages/RevisionDetails'));
const NoAccessPage = lazy(() => import('pages/NoAccessPage'));

export function ModelRoutes() {
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
    <Routes>
      <Route path="/:tenant/3d-models" element={FallbackWrapper(AllModels)} />
      <Route
        path="/:tenant/3d-models/:modelId/revisions/:revisionId"
        element={FallbackWrapper(RevisionDetails)}
      />
      <Route path="*" element={FallbackWrapper(NoAccessPage)} />
    </Routes>
  );
}
