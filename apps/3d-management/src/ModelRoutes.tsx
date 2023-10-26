import { lazy } from 'react';
import { Route, Routes } from 'react-router-dom';

import { FallbackWrapper } from './components/FallbackWrapper';

// lazy loads
const AllModels = lazy(() => import('./pages/AllModels'));
const RevisionDetails = lazy(() => import('./pages/RevisionDetails'));
const ContextualizeEditor = lazy(() => import('./pages/ContextualizeEditor'));
const NoAccessPage = lazy(() => import('./pages/NoAccessPage'));

export function ModelRoutes() {
  return (
    <Routes>
      <Route path="/:tenant/3d-models" element={FallbackWrapper(AllModels)} />
      <Route
        path="/:tenant/3d-models/:modelId/revisions/:revisionId"
        element={FallbackWrapper(RevisionDetails)}
      />
      <Route
        path="/:tenant/3d-models/contextualize-editor/:modelId/revisions/:revisionId"
        element={FallbackWrapper(ContextualizeEditor)}
      />
      <Route path="*" element={FallbackWrapper(NoAccessPage)} />
    </Routes>
  );
}
