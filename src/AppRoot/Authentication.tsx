import React, { useContext, useEffect, useState } from 'react';
import { TenantContext } from 'providers/TenantProvider';
import { CdfClientContext } from 'providers/CdfClientProvider';
import { useDispatch, useSelector } from 'react-redux';
import { authenticate } from 'store/auth/thunks';
import { fetchSuites } from 'store/suites/thunks';
import { RootDispatcher } from 'store/types';
import { getAuthState } from 'store/auth/selectors';
import { Loader } from '@cognite/cogs.js';
import { getSuitesTableState } from 'store/suites/selectors';
import Routes from './Routes';import { ApiClientContext } from 'providers/ApiClientProvider';

const Authentication = (): JSX.Element => {
  const tenant = useContext(TenantContext);
  const client = useContext(CdfClientContext);
  const apiClient = useContext(ApiClientContext);
  const dispatch = useDispatch<RootDispatcher>();
  const { authenticating, authenticated } = useSelector(getAuthState);
  const { loading: suitesLoading, loaded: suitesLoaded } = useSelector(
    getSuitesTableState
  );

  const [authenticateDispatched, setAuthenticateDispatched] = useState(false);

  useEffect(() => {
    const auth = async () => {
      await dispatch(authenticate(tenant, client, apiClient));
      await dispatch(fetchSuites(apiClient));
      setAuthenticateDispatched(true);
    };
    if (!authenticateDispatched && !authenticated && !authenticating) {
      auth();
    }
  }, [
    client,
    apiClient,
    tenant,
    authenticated,
    authenticating,
    authenticateDispatched,
    dispatch,
    suitesLoading,
    suitesLoaded,
  ]);

  return <>{authenticated ? <Routes /> : <Loader />}</>;
};

export default Authentication;
