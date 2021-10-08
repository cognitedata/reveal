import { lazy, Suspense } from 'react';
import { Spinner } from '../../components/Spinner/Spinner';

const SolutionsList = lazy(() =>
  import('./SolutionsList').then((module) => ({
    default: module.SolutionsList,
  }))
);

export const SolutionsPage = () => (
  <Suspense fallback={<Spinner />}>
    <SolutionsList />
  </Suspense>
);
