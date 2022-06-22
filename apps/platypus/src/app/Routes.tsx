import React from 'react';
import { Route, Switch } from 'react-router-dom';
import { DataModelsPage } from './modules/data-models/DataModelsPage';
import { GuideToolsPage } from './modules/guides/GuideToolsPage';
import { StatusPage } from './modules/statusboard/StatusboardPage';
import { DataModel } from './modules/solution/DataModel';
import { NavigationDataModel } from './components/Navigations/NavigationDataModel';
import { Spinner } from './components/Spinner/Spinner';
import { useFusionQuery } from './hooks/useFusionQuery';

const Routes = () => {
  useFusionQuery();
  return (
    <React.Suspense fallback={<Spinner />}>
      <Switch>
        <Route exact path={['/', '/data-models']}>
          <DataModelsPage />
        </Route>
        <Route
          exact
          path={[
            '/data-models/:dataModelExternalId?/:version?/:tabKey?/:solutionPage?/:subSolutionPage?',
          ]}
        >
          <NavigationDataModel />
          <DataModel />
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
