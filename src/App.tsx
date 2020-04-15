import React, { useState } from 'react';
import TitleChanger from 'TitleChanger.tsx';
import { getSidecar } from 'utils';
import TenantSelectorScreen from 'TenantSelectorScreen';
import useTenantSelector from 'useTenantSelector';

const App = () => {
  const { applicationId } = getSidecar();
  const [authenticating, setAuthenticating] = useState(false);

  const {
    onTenantSelected,
    checkTenantValidity,
    validatingTenant,
    redirecting,
  } = useTenantSelector(applicationId);

  const errorFooter = authenticating ? (
    <>
      <div>Something is taking longer than usual. Please refresh the page.</div>
      <div>
        Contact{' '}
        <a href={`mailto:support@cognite.com?subject=Error ID: ${'errorId'}`}>
          support@cognite.com
        </a>{' '}
        if the problem persists.
      </div>
    </>
  ) : null;

  return (
    <>
      <TitleChanger />
      <TenantSelectorScreen
        validateTenant={checkTenantValidity}
        handleSubmit={onTenantSelected}
        loading={redirecting || authenticating || validatingTenant}
        error={undefined}
      />
    </>
  );
};

export default App;
