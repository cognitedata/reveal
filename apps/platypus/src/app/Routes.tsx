import React from 'react';
import { Route, Switch } from 'react-router-dom';
import { SolutionsPage } from './pages/solutions/SolutionsPage';
import { GuideToolsPage } from './pages/guide&tools/GuideToolsPage';
import { StatusPage } from './pages/statusboard/StatusboardPage';

const Routes = () => {
  return (
    <React.Suspense fallback={<p>Loading&hellip;</p>}>
      <Switch>
        <Route
          exact
          path={['/', '/solutions/:solutionId?/:tabKey?/:solutionPage?']}
        >
          <SolutionsPage />
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
