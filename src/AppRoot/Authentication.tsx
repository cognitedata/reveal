import React, { useContext, useEffect, useState } from 'react';
import { TenantContext } from 'providers/TenantProvider';
import { CdfClientContext } from 'providers/CdfClientProvider';
import { useDispatch, useSelector } from 'react-redux';
import { authenticate } from 'store/auth/thunks';
import { RootDispatcher } from 'store/types';
import { getAuthState } from 'store/auth/selectors';
import { Loader } from '@cognite/cogs.js';
import Routes from './Routes';

const Authentication = (): JSX.Element => {
  const tenant = useContext(TenantContext);
  const client = useContext(CdfClientContext);
  const dispatch = useDispatch<RootDispatcher>();
  const { authenticating, authenticated } = useSelector(getAuthState);

  const [authenticateDispatched, setAuthenticateDispatched] = useState(false);

  useEffect(() => {
    if (!authenticateDispatched && !authenticated && !authenticating) {
      dispatch(authenticate(tenant, client));
      setAuthenticateDispatched(true);
    }
  }, [
    client,
    tenant,
    authenticated,
    authenticating,
    authenticateDispatched,
    dispatch,
  ]);

  return <>{authenticated ? <Routes /> : <Loader />}</>;
};

export default Authentication;
