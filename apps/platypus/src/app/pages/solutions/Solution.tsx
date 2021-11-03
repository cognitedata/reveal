import { lazy, Suspense } from 'react';
import { Route, Switch } from 'react-router-dom';
import { Spinner } from '../../components/Spinner/Spinner';
import { StyledPageWrapper } from '../styles/SharedStyles';

const OverviewPage = lazy(() =>
  import('./solutionPages/OverviewLayout').then((module) => ({
    default: module.OverviewLayout,
  }))
);

const DataModelPage = lazy(() =>
  import('./solutionPages/DataModelLayout').then((module) => ({
    default: module.DataModelLayout,
  }))
);

const DevelopmentToolsPage = lazy(() =>
  import('./solutionPages/DevelopmentToolsPage').then((module) => ({
    default: module.DevelopmentToolsPage,
  }))
);

const DeploymentsPage = lazy(() =>
  import('./solutionPages/DeploymentsPage').then((module) => ({
    default: module.DeploymentsPage,
  }))
);

const SettingsPage = lazy(() =>
  import('./solutionPages/SettingsPage').then((module) => ({
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
