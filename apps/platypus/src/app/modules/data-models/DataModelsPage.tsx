import { lazy, Suspense } from 'react';

import { Spinner } from '@platypus-app/components/Spinner/Spinner';

const DataModelsList = lazy(() =>
  import('./pages/DataModelsList').then((module) => ({
    default: module.DataModelsList,
  }))
);

export const DataModelsPage = () => (
  <Suspense fallback={<Spinner />}>
    <DataModelsList />
  </Suspense>
);
