import { useEffect, lazy, Suspense } from 'react';
import { Route, Switch, useParams } from 'react-router-dom';

import useSelector from '@platypus-app/hooks/useSelector';
import { SolutionState } from '@platypus-app/redux/reducers/global/solutionReducer';

import { Spinner } from '@platypus-app/components/Spinner/Spinner';
import { StyledPageWrapper } from '@platypus-app/components/Layouts/elements';
import { useSolution } from './hooks/useSolution';
import { ActionStatus } from '@platypus-app/types';

const OverviewPage = lazy<any>(() =>
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
  const { solutionId } = useParams<{
    solutionId: string;
  }>();

  const { solution, selectedSchema, solutionStatus, schemasStatus } =
    useSelector<SolutionState>((state) => state.solution);

  const { fetchVersions, fetchSolution } = useSolution();

  useEffect(() => {
    fetchSolution(solutionId);
  }, [fetchSolution, solutionId]);

  useEffect(() => {
    fetchVersions(solutionId);
  }, [fetchVersions, solutionId]);

  if (
    solutionStatus === ActionStatus.SUCCESS &&
    schemasStatus === ActionStatus.SUCCESS
  ) {
    return (
      <StyledPageWrapper>
        <Switch>
          <Route
            exact
            path={[
              '/solutions/:solutionId?/:version?',
              '/solutions/:solutionId?/:version?/overview/:solutionPage?',
            ]}
          >
            <Suspense fallback={<Spinner />}>
              <OverviewPage solution={solution} schema={selectedSchema} />
            </Suspense>
          </Route>
          <Route
            exact
            path="/solutions/:solutionId?/:version?/data-model/:solutionPage?"
          >
            <Suspense fallback={<Spinner />}>
              <DataModelPage />
            </Suspense>
          </Route>
          <Route
            exact
            path="/solutions/:solutionId?/:version?/development-tools"
          >
            <Suspense fallback={<Spinner />}>
              <DevelopmentToolsPage />
            </Suspense>
          </Route>
          <Route exact path="/solutions/:solutionId?/:version?/deployments">
            <Suspense fallback={<Spinner />}>
              <DeploymentsPage />
            </Suspense>
          </Route>
          <Route exact path="/solutions/:solutionId?/:version?/settings">
            <Suspense fallback={<Spinner />}>
              <SettingsPage />
            </Suspense>
          </Route>
        </Switch>
      </StyledPageWrapper>
    );
  }

  if (
    solutionStatus === ActionStatus.FAIL ||
    schemasStatus === ActionStatus.FAIL
  ) {
    return <Spinner />;
  }
  return <Spinner />;
};
