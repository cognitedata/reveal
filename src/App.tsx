import React, { useState, useCallback } from 'react';
import TitleChanger from 'TitleChanger.tsx';
import { getSidecar } from 'utils';
import TenantSelectorScreen from 'TenantSelectorScreen';
import useTenantSelector from 'useTenantSelector';

const App = () => {
  const { applicationId } = getSidecar();
  const [authenticating, setAuthenticating] = useState(false);

  const possibleTenant = window.location.pathname.replace(
    /^\/([^/]*).*$/,
    '$1'
  );

  const {
    onTenantSelected,
    checkTenantValidity,
    validatingTenant,
    redirecting,
    initialTenant,
  } = useTenantSelector(applicationId);

  const isLoading =
    redirecting ||
    authenticating ||
    validatingTenant ||
    initialTenant === possibleTenant;

  // TODO: Set a timeout here so that we detect if we're ever in this loading
  // state for too long.

  const performValidation = useCallback(
    (tenant: string) => {
      setAuthenticating(true);
      return checkTenantValidity(tenant).finally(() => {
        setAuthenticating(false);
      });
    },
    [checkTenantValidity]
  );

  return (
    <>
      <TitleChanger />
      <TenantSelectorScreen
        validateTenant={performValidation}
        handleSubmit={onTenantSelected}
        initialTenant={initialTenant || ''}
        loading={isLoading}
        error={undefined}
      />
    </>
  );
};

export default App;
