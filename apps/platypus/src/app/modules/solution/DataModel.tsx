import { BasicPlaceholder } from '@platypus-app/components/BasicPlaceholder/BasicPlaceholder';
import { StyledPageWrapper } from '@platypus-app/components/Layouts/elements';
import { Spinner } from '@platypus-app/components/Spinner/Spinner';
import {
  useDataModel,
  useDataModelVersions,
} from '@platypus-app/hooks/useDataModelActions';
import { useTranslation } from '@platypus-app/hooks/useTranslation';
import solutionStateSlice, {
  actions,
} from '@platypus-app/redux/reducers/global/dataModelReducer';
import { lazy, Suspense, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Route, Switch, useParams } from 'react-router-dom';

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

export const DataModel = () => {
  const { t } = useTranslation('DataModel');
  const dispatch = useDispatch();

  const { dataModelExternalId, version } = useParams<{
    dataModelExternalId: string;
    version: string;
  }>();

  const [isReady, setIsReady] = useState(false);

  const {
    data: dataModel,
    isLoading: isDataModelLoading,
    isError: hasDataModelError,
    isSuccess: isDataModelLoaded,
  } = useDataModel(dataModelExternalId);

  const {
    data: dataModelVersions,
    isLoading: areDataModelVersionsLoading,
    isError: hasDataModelVersionError,
    isSuccess: areDataModelVersionsLoaded,
  } = useDataModelVersions(dataModelExternalId);

  useEffect(
    () => {
      // wait for both requests to finish and update redux store
      if (isDataModelLoaded && areDataModelVersionsLoaded) {
        dispatch(actions.setDataModel({ dataModel: dataModel! }));
        dispatch(
          actions.setDataModelVersions({
            dataModelVersions: dataModelVersions!,
          })
        );
        dispatch(
          solutionStateSlice.actions.selectVersion({
            version,
          })
        );

        setIsReady(true);
      }
    },
    // eslint-disable-next-line
    [isDataModelLoaded, areDataModelVersionsLoaded, version]
  );

  if (hasDataModelError || hasDataModelVersionError) {
    return (
      <div data-testid="data_model_not_found">
        <BasicPlaceholder
          type="Documents"
          title={t(
            'data_model_not_found',
            'Something went wrong, we were not able to load the Data Model!'
          )}
        />
      </div>
    );
  }

  if (isDataModelLoading || areDataModelVersionsLoading || !isReady) {
    return (
      <div data-testid="data_model_loader">
        <Spinner />
      </div>
    );
  }

  return (
    <StyledPageWrapper data-testid="data_model_page_wrapper">
      <Switch>
        <Route
          exact
          path={[
            '/data-models/:dataModelExternalId?/:version?',
            '/data-models/:dataModelExternalId?/:version?/data/:solutionPage?/:subSolutionPage?',
          ]}
        >
          <Suspense fallback={<Spinner />}>
            <DataPage />
          </Suspense>
        </Route>
        <Route
          exact
          path={[
            '/data-models/:dataModelExternalId?/:version?/overview/:solutionPage?',
          ]}
        >
          <Suspense fallback={<Spinner />}>
            <OverviewPage />
          </Suspense>
        </Route>
        <Route exact path="/data-models/:dataModelExternalId?/:version?/tools">
          <Suspense fallback={<Spinner />}>
            <ToolsPage />
          </Suspense>
        </Route>
        <Route
          exact
          path="/data-models/:dataModelExternalId?/:version?/deployments"
        >
          <Suspense fallback={<Spinner />}>
            <DeploymentsPage />
          </Suspense>
        </Route>
        <Route
          exact
          path="/data-models/:dataModelExternalId?/:version?/settings"
        >
          <Suspense fallback={<Spinner />}>
            <SettingsPage />
          </Suspense>
        </Route>
      </Switch>
    </StyledPageWrapper>
  );
};
