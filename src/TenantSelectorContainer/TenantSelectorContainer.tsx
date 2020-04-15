import React from 'react';
import TenantSelectorScreen from 'TenantSelectorScreen';

import useTenantSelector from './useTenantSelector';

type Props = {
  applicationId: string;
  authenticating?: boolean;
  error?: React.ReactNode;
};

const TenantSelectorContainer = ({
  applicationId,
  authenticating = false,
  error,
}: Props) => {
  const {
    onTenantSelected,
    checkTenantValidity,
    validatingTenant,
    redirecting,
  } = useTenantSelector(applicationId);

  return (
    <TenantSelectorScreen
      validateTenant={checkTenantValidity}
      handleSubmit={onTenantSelected}
      loading={redirecting || authenticating || validatingTenant}
      error={error}
    />
  );
};

export default TenantSelectorContainer;
