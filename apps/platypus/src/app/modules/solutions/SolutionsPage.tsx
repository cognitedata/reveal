import { lazy, Suspense } from 'react';
import { Route, Switch } from 'react-router-dom';
import { NavigationMain } from '../../components/Navigations/NavigationMain';
import { NavigationSolution } from '../../components/Navigations/NavigationSolution';
import { Spinner } from '../../components/Spinner/Spinner';

const SolutionsList = lazy(() =>
  import('./SolutionsList').then((module) => ({
    default: module.SolutionsList,
  }))
);

const Solution = lazy(() =>
  import('./Solution').then((module) => ({
    default: module.Solution,
  }))
);

export const SolutionsPage = () => (
  <Switch>
    <Route exact path={['/', '/solutions']}>
      <NavigationMain />
      <Suspense fallback={<Spinner />}>
        <SolutionsList />
      </Suspense>
    </Route>
    <Route exact path="/solutions/:solutionId?/:tabKey?/:solutionPage?">
      <NavigationSolution />
      <Suspense fallback={<Spinner />}>
        <Solution />
      </Suspense>
    </Route>
  </Switch>
);
