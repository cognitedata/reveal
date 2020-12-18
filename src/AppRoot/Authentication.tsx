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
import Routes from './Routes';

const Authentication = (): JSX.Element => {
  const tenant = useContext(TenantContext);
  const client = useContext(CdfClientContext);
  const apiClient = useContext(ApiClientContext);
  const dispatch = useDispatch<RootDispatcher>();
  const { authenticating, authenticated } = useSelector(getAuthState);
  const { loading: suitesLoading, loaded: suitesLoaded } = useSelector(
    getSuitesTableState
  );
  const { loading: groupsLoading, loaded: groupsLoaded } = useSelector(
    getGroupsState
  );

  const [authenticateDispatched, setAuthenticateDispatched] = useState(false);

  const loading = authenticating || suitesLoading || groupsLoading;
  const ready = authenticated && suitesLoaded && groupsLoaded;

  useEffect(() => {
    const auth = async () => {
      await dispatch(authenticate(tenant, client, apiClient));
      await dispatch(fetchUserGroups(client));
      await dispatch(fetchSuites(apiClient));
      setAuthenticateDispatched(true);
    };
    if (!authenticateDispatched && !ready && !loading) {
      auth();
    }
  }, [
    client,
    apiClient,
    tenant,
    authenticateDispatched,
    dispatch,
    ready,
    loading,
  ]);

  return <>{ready ? <Routes /> : <Loader />}</>;
};

export default Authentication;
