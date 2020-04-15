import { useState } from 'react';

import axios from 'axios';
import { getSidecar } from './utils';

const useTenantSelector = (appName: string) => {
  const { appsApiBaseUrl } = getSidecar();
  const [validatingTenant, setValidatingTenant] = useState(false);
  const [redirecting, setRedirecting] = useState(false);

  const onTenantSelected = (newTenant: string) => {
    setRedirecting(true);
    const { hash, pathname, search } = window.location;
    let url = `/${newTenant}`;
    if (pathname) {
      url += pathname;
    }
    url += (search || '') + (hash || '');
    window.location.href = url;
  };

  const checkTenantValidity = (tenant: string) => {
    setValidatingTenant(true);
    return axios
      .get(`${appsApiBaseUrl}/tenant`, {
        params: { tenant, app: appName },
      })
      .then(() => {
        setValidatingTenant(false);
        return true;
      })
      .catch((e) => {
        setValidatingTenant(false);
        throw e;
      });
  };

  return {
    checkTenantValidity,
    onTenantSelected,
    validatingTenant,
    redirecting,
  };
};

export default useTenantSelector;
