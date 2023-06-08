import React, { lazy } from 'react';
import { Route, Routes } from 'react-router-dom';

import { FallbackWrapper } from '@3d-management/components/FallbackWrapper';

import { getFlow } from '@cognite/cdf-sdk-singleton';
import { Loader } from '@cognite/cogs.js';
import { usePermissions } from '@cognite/sdk-react-query-hooks';

// lazy loads
const AllModels = lazy(() => import('@3d-management/pages/AllModels'));
const RevisionDetails = lazy(
  () => import('@3d-management/pages/RevisionDetails')
);
const NoAccessPage = lazy(() => import('@3d-management/pages/NoAccessPage'));

export function ModelRoutes() {
  const { flow } = getFlow();
  const {
    data: threedRead,
    isFetched: threedReadFetched,
    error: threedReadError,
  } = usePermissions(flow as any, 'threedAcl', 'READ');

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
