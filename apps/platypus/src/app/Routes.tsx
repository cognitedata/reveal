import React from 'react';
import { Route, Switch } from 'react-router-dom';
import { DataModelsPage } from './modules/data-models/DataModelsPage';
import { GuideToolsPage } from './modules/guides/GuideToolsPage';
import { StatusPage } from './modules/statusboard/StatusboardPage';
import { NavigationMain } from './components/Navigations/NavigationMain';
import { Solution } from './modules/solution/Solution';
import { NavigationSolution } from './components/Navigations/NavigationSolution';
import { Spinner } from './components/Spinner/Spinner';
import { useFusionQuery } from './hooks/useFusionQuery';

const Routes = () => {
  useFusionQuery();
  return (
    <React.Suspense fallback={<Spinner />}>
      <Switch>
        <Route exact path={['/', '/data-models']}>
          <NavigationMain />
          <DataModelsPage />
        </Route>
        <Route
          exact
          path={[
            '/data-models/:solutionId?/:version?/:tabKey?/:solutionPage?/:subSolutionPage?',
          ]}
        >
          <NavigationSolution />
          <Solution />
        </Route>
        <Route exact path="/guidetools">
          <GuideToolsPage />
        </Route>
        <Route exact path="/statusboard">
          <StatusPage />
        </Route>
      </Switch>
    </React.Suspense>
  );
};

export default Routes;
