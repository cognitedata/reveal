import { lazy, Suspense } from 'react';
import { Route, Switch } from 'react-router-dom';

import { Spinner } from '@platypus-app/components/Spinner/Spinner';
import { StyledPageWrapper } from '@platypus-app/components/Layouts/elements';

const OverviewPage = lazy(() =>
  import('./OverviewLayout').then((module) => ({
    default: module.OverviewLayout,
  }))
);

const DataModelPage = lazy(() =>
  import('./DataModelLayout').then((module) => ({
    default: module.DataModelLayout,
  }))
);

const DevelopmentToolsPage = lazy(() =>
  import('./development-tools/pages/DevelopmentToolsPage').then((module) => ({
    default: module.DevelopmentToolsPage,
  }))
);

const DeploymentsPage = lazy(() =>
  import('./deployments/pages/DeploymentsPage').then((module) => ({
    default: module.DeploymentsPage,
  }))
);

const SettingsPage = lazy(() =>
  import('./settings/pages/SettingsPage').then((module) => ({
    default: module.SettingsPage,
  }))
);

export const Solution = () => {
  return (
    <StyledPageWrapper>
      <Switch>
        <Route
          exact
          path={[
            '/solutions/:solutionId?',
            '/solutions/:solutionId?/overview/:solutionPage?',
          ]}
        >
          <Suspense fallback={<Spinner />}>
            <OverviewPage />
          </Suspense>
        </Route>
        <Route exact path="/solutions/:solutionId?/data-model/:solutionPage?">
          <Suspense fallback={<Spinner />}>
            <DataModelPage />
          </Suspense>
        </Route>
        <Route exact path="/solutions/:solutionId?/development-tools">
          <Suspense fallback={<Spinner />}>
            <DevelopmentToolsPage />
          </Suspense>
        </Route>
        <Route exact path="/solutions/:solutionId?/deployments">
          <Suspense fallback={<Spinner />}>
            <DeploymentsPage />
          </Suspense>
        </Route>
        <Route exact path="/solutions/:solutionId?/settings">
          <Suspense fallback={<Spinner />}>
            <SettingsPage />
          </Suspense>
        </Route>
      </Switch>
    </StyledPageWrapper>
  );
};
