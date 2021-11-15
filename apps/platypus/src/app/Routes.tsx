import React from 'react';
import { Route, Switch } from 'react-router-dom';
import { SolutionsPage } from './modules/solutions/SolutionsPage';
import { GuideToolsPage } from './modules/guides/GuideToolsPage';
import { StatusPage } from './modules/statusboard/StatusboardPage';

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
