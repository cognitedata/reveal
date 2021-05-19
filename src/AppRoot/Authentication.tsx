import { useContext, useEffect, useState } from 'react';
import { TenantContext } from 'providers/TenantProvider';
import { CdfClientContext } from 'providers/CdfClientProvider';
import { useDispatch, useSelector } from 'react-redux';
import { RootDispatcher } from 'store/types';
import { getGroupsState } from 'store/groups/selectors';
import { Loader } from '@cognite/cogs.js';
import { getSuitesTableState } from 'store/suites/selectors';
import { ApiClientContext } from 'providers/ApiClientProvider';
import ErrorPage from 'pages/ErrorPage';
import { getMetrics } from 'utils/metrics';
import { Metrics as CogniteMetrics } from '@cognite/metrics';
import { getDataSet } from 'store/config/thunks';
import { AuthProvider } from '@cognite/react-container';
import { fetchAppData } from 'store/thunks';
import Routes from './Routes';

const Authentication = (): JSX.Element => {
  const tenant = useContext(TenantContext);
  const client = useContext(CdfClientContext);
  const { authState } = useContext(AuthProvider);
  const apiClient = useContext(ApiClientContext);
  const dispatch = useDispatch<RootDispatcher>();
  const {
    loading: suitesLoading,
    loaded: suitesLoaded,
    loadFailed: suitesLoadError,
  } = useSelector(getSuitesTableState);
  const {
    loading: groupsLoading,
    loaded: groupsLoaded,
    error: groupsLoadError,
    isAdmin,
  } = useSelector(getGroupsState);

  const [fetchDispatched, setFetchDispatched] = useState(false);
  const [retrieveDataSetDispatched, setRetrieveDataSetDispatched] = useState(
    false
  );

  const loading = suitesLoading || groupsLoading;
  const dataLoaded = suitesLoaded && groupsLoaded;
  const hasError = suitesLoadError || groupsLoadError;

  const Metrics = getMetrics();

  // fetch suites & groups
  useEffect(() => {
    const fetch = async () => {
      setFetchDispatched(true);
      await dispatch(
        fetchAppData(apiClient, Metrics.create('Auth') as CogniteMetrics)
      );
    };
    if (
      authState?.authenticated &&
      !fetchDispatched &&
      !loading &&
      !hasError &&
      authState.email
    ) {
      Metrics.identify(authState.email);
      Metrics.people({
        name: authState.email,
        $email: authState.email,
      });
      Metrics.props({ tenant });
      fetch();
    }
  }, [
    apiClient,
    dispatch,
    authState,
    loading,
    hasError,
    fetchDispatched,
    tenant,
    Metrics,
  ]);

  // retrieve/create data set if admin user
  useEffect(() => {
    if (dataLoaded && isAdmin && !retrieveDataSetDispatched) {
      setRetrieveDataSetDispatched(true);
      dispatch(getDataSet(client));
    }
  }, [dataLoaded, isAdmin, retrieveDataSetDispatched, client, dispatch]);

  if (hasError) {
    return <ErrorPage />;
  }

  return (
    <>{authState?.authenticated && dataLoaded ? <Routes /> : <Loader />}</>
  );
};

export default Authentication;
