import { useEffect, lazy, Suspense, useState } from 'react';
import { Route, Switch, useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';

import useSelector from '@platypus-app/hooks/useSelector';
import { SolutionState } from '@platypus-app/redux/reducers/global/solutionReducer';

import { Spinner } from '@platypus-app/components/Spinner/Spinner';
import { StyledPageWrapper } from '@platypus-app/components/Layouts/elements';
import { useSolution } from './hooks/useSolution';
import { ActionStatus } from '@platypus-app/types';
import solutionStateSlice from '@platypus-app/redux/reducers/global/solutionReducer';
import { BasicPlaceholder } from '@platypus-app/components/BasicPlaceholder/BasicPlaceholder';
import { useTranslation } from '@platypus-app/hooks/useTranslation';

const OverviewPage = lazy<any>(() =>
  import('./OverviewLayout').then((module) => ({
    default: module.OverviewLayout,
  }))
);

const DataPage = lazy(() =>
  import('./DataLayout').then((module) => ({
    default: module.DataLayout,
  }))
);

const ToolsPage = lazy(() =>
  import('./tools/pages/ToolsPage').then((module) => ({
    default: module.ToolsPage,
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
  const { t } = useTranslation('Solution');
  const dispatch = useDispatch();
  const [successLoaded, setSuccessLoaded] = useState(false);

  const { solutionId, version } = useParams<{
    solutionId: string;
    version: string;
  }>();
  const { solutionStatus, schemasStatus, schemas, selectedSchema } =
    useSelector<SolutionState>((state) => state.solution);

  const { fetchVersions, fetchSolution } = useSolution();

  useEffect(() => {
    fetchSolution(solutionId);
  }, [fetchSolution, solutionId]);

  useEffect(() => {
    fetchVersions(solutionId);
  }, [fetchVersions, solutionId]);

  useEffect(() => {
    if (successLoaded) {
      dispatch(
        solutionStateSlice.actions.selectVersion({
          version,
        })
      );
    }
  }, [dispatch, version, successLoaded]);

  useEffect(() => {
    if (
      solutionStatus === ActionStatus.SUCCESS &&
      schemasStatus === ActionStatus.SUCCESS
    ) {
      setSuccessLoaded(true);
    }
  }, [dispatch, schemasStatus, solutionStatus]);

  if (successLoaded && (selectedSchema || !schemas.length)) {
    return (
      <StyledPageWrapper data-testid="solution_page_wrapper">
        <Switch>
          <Route
            exact
            path={[
              '/solutions/:solutionId?/:version?',
              '/solutions/:solutionId?/:version?/overview/:solutionPage?',
            ]}
          >
            <Suspense fallback={<Spinner />}>
              <OverviewPage />
            </Suspense>
          </Route>
          <Route
            exact
            path="/solutions/:solutionId?/:version?/data/:solutionPage?/:subSolutionPage?"
          >
            <Suspense fallback={<Spinner />}>
              <DataPage />
            </Suspense>
          </Route>
          <Route exact path="/solutions/:solutionId?/:version?/tools">
            <Suspense fallback={<Spinner />}>
              <ToolsPage />
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

  if (solutionStatus === ActionStatus.FAIL) {
    return (
      <div data-testid="solution_not_found">
        <BasicPlaceholder
          type="Documents"
          title={t('solution_not_found', 'Solution is not found')}
        />
      </div>
    );
  }

  if (
    schemasStatus === ActionStatus.FAIL ||
    (!selectedSchema && schemas.length)
  ) {
    return (
      <div data-testid="schema_not_found">
        <BasicPlaceholder
          type="Documents"
          title={t('schema_not_found', 'Schema is not found')}
        />
      </div>
    );
  }

  return <Spinner />;
};
