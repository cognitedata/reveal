import React, { useContext, useEffect, useState } from 'react';
import { TenantContext } from 'providers/TenantProvider';
import { CdfClientContext } from 'providers/CdfClientProvider';
import { useDispatch, useSelector } from 'react-redux';
import { authenticate } from 'store/auth/thunks';
import { fetchSuites } from 'store/suites/thunks';
import { fetchUserGroups } from 'store/groups/thunks';
import { RootDispatcher } from 'store/types';
import { getAuthState } from 'store/auth/selectors';
import { getGroupsState } from 'store/groups/selectors';
import { Loader } from '@cognite/cogs.js';
import { getSuitesTableState } from 'store/suites/selectors';
import { ApiClientContext } from 'providers/ApiClientProvider';
import ErrorPage from 'pages/ErrorPage';
import { getMetrics } from 'utils/metrics';
import { getDataSet } from 'store/config/thunks';
import Routes from './Routes';

const Authentication = (): JSX.Element => {
  const tenant = useContext(TenantContext);
  const client = useContext(CdfClientContext);
  const apiClient = useContext(ApiClientContext);
  const dispatch = useDispatch<RootDispatcher>();
  const { authenticating, authenticated, userId } = useSelector(getAuthState);
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

  const [authenticateDispatched, setAuthenticateDispatched] = useState(false);
  const [fetchDispatched, setFetchDispatched] = useState(false);
  const [retrieveDataSetDispatched, setRetrieveDataSetDispatched] = useState(
    false
  );

  const loading = authenticating || suitesLoading || groupsLoading;
  const dataLoaded = suitesLoaded && groupsLoaded;
  const hasError = suitesLoadError || groupsLoadError;

  const Metrics = getMetrics();

  // authentication
  useEffect(() => {
    const auth = async () => {
      await dispatch(authenticate(tenant, client, apiClient));
      setAuthenticateDispatched(true);
    };
    if (!authenticateDispatched && !authenticating && !authenticated) {
      auth();
    }
  }, [
    client,
    apiClient,
    tenant,
    authenticateDispatched,
    dispatch,
    authenticating,
    authenticated,
  ]);

  // fetch suites & groups
  useEffect(() => {
    const fetch = async () => {
      setFetchDispatched(true);
      await dispatch(fetchUserGroups(apiClient));
      await dispatch(fetchSuites(apiClient));
    };
    if (authenticated && !fetchDispatched && !loading && !hasError) {
      Metrics.identify(userId);
      Metrics.people({
        name: userId,
        $email: userId,
      });
      Metrics.props({ tenant });
      fetch();
    }
  }, [
    client,
    apiClient,
    dispatch,
    authenticated,
    loading,
    hasError,
    fetchDispatched,
    userId,
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

  return <>{authenticated && dataLoaded ? <Routes /> : <Loader />}</>;
};

export default Authentication;
