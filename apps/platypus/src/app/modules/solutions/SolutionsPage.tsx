import { lazy, Suspense } from 'react';

import { Spinner } from '@platypus-app/components/Spinner/Spinner';

const SolutionsList = lazy(() =>
  import('./pages/SolutionsList').then((module) => ({
    default: module.SolutionsList,
  }))
);

export const SolutionsPage = () => (
  <Suspense fallback={<Spinner />}>
    <SolutionsList />
  </Suspense>
);
