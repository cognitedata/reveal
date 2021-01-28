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
import { Body, Loader } from '@cognite/cogs.js';
import { getSuitesTableState } from 'store/suites/selectors';
import { ApiClientContext } from 'providers/ApiClientProvider';
import { useIntercom } from 'react-use-intercom';
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
    error: suitesLoadError,
  } = useSelector(getSuitesTableState);
  const {
    loading: groupsLoading,
    loaded: groupsLoaded,
    error: groupsLoadError,
  } = useSelector(getGroupsState);

  const { boot: bootIntercom } = useIntercom();

  const [authenticateDispatched, setAuthenticateDispatched] = useState(false);
  const [fetchDispatched, setFetchDispatched] = useState(false);

  const loading = authenticating || suitesLoading || groupsLoading;
  const dataLoaded = suitesLoaded && groupsLoaded;
  const hasError = suitesLoadError || groupsLoadError;

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

  useEffect(() => {
    const fetch = async () => {
      setFetchDispatched(true);
      await dispatch(fetchUserGroups(apiClient));
      await dispatch(fetchSuites(apiClient));
    };
    if (authenticated && !fetchDispatched && !loading && !hasError) {
      bootIntercom({
        email: userId,
        customAttributes: { hide_default_launcher: true },
      });
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
    bootIntercom,
    userId,
  ]);

  if (hasError) {
    return (
      <>
        <Body>Failed to fetch data from database</Body>
      </>
    );
  }

  return <>{authenticated && dataLoaded ? <Routes /> : <Loader />}</>;
};

export default Authentication;
