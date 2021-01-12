import React, { useEffect, useMemo, useState } from 'react';
import { DEFAULT_TENANT } from 'constants/cdf';
import { usePossibleTenant } from 'hooks';
import { validateTenant } from 'utils/tenant';
import {
  createBrowserHistory as createNewBrowserHistory,
  History,
} from 'history';
import Authentication from './Authentication';
import AppProviders from './AppProviders';

const AppRoot = (): JSX.Element => {
  // TODO(DTC-162) remove default tenant
  const tenant = usePossibleTenant() || DEFAULT_TENANT;

  const history = useMemo(() => {
    return createBrowserHistory(tenant);
  }, [tenant]);

  const [tenantOk, setTenantOk] = useState(false);

  useEffect(() => {
    validateTenant(tenant).then((valid) => {
      if (valid) {
        setTenantOk(valid);
      } else if (tenant) {
        window.location.pathname = '/';
      }
    });
  }, [tenant]);

  if (!tenantOk || !tenant) {
    return <></>;
  }

  return (
    <AppProviders history={history} tenant={tenant}>
      <Authentication />
    </AppProviders>
  );
};

const createBrowserHistory = (possibleTenant: string): History => {
  return createNewBrowserHistory({
    basename: possibleTenant,
  });
};

export default AppRoot;
