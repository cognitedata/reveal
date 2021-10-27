import { lazy, Suspense } from 'react';
import { NavigationMain } from '../../components/Navigations/NavigationMain';
import { Spinner } from '../../components/Spinner/Spinner';

const GuideTools = lazy(() =>
  import('./GuideTools').then((module) => ({
    default: module.GuideTools,
  }))
);

export const GuideToolsPage = () => (
  <>
    <NavigationMain />
    <Suspense fallback={<Spinner />}>
      <GuideTools />
    </Suspense>
  </>
);
