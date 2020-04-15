import { useState } from 'react';
import useMetrics from 'useMetrics';
import { getSidecar, getLastTenant } from 'utils';
import Axios from 'axios';

const useTenantSelector = (applicationId: string) => {
  const { appsApiBaseUrl } = getSidecar();
  const metrics = useMetrics('TenantSelector');
  const initialTenant = getLastTenant();
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
    const timer = metrics.start('checkTenantValidity', {
      tenantName: tenant,
      appName: applicationId,
      initialTenant,
    });

    return Axios.get(`${appsApiBaseUrl}/tenant`, {
      params: { tenant, app: applicationId },
    })
      .then(() => {
        setValidatingTenant(false);
        timer.stop({ valid: true });
        return true;
      })
      .catch((e) => {
        setValidatingTenant(false);
        timer.stop({ valid: false });
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
