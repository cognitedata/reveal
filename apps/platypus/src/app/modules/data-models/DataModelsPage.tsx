import { lazy, Suspense } from 'react';

import { Spinner } from '../../components/Spinner/Spinner';

const DataModelsList = lazy(() =>
  import('./pages/DataModelsList').then((module) => ({
    default: module.DataModelsList,
  }))
);

export const DataModelsPage = () => {
  return (
    <Suspense fallback={<Spinner />}>
      <DataModelsList />
    </Suspense>
  );
};
