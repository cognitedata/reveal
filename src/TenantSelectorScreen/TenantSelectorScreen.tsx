import React from 'react';

import AuthenticationScreen from 'AuthenticationScreen';
import TenantSelector from 'TenantSelector';

type Props = {
  handleSubmit: (tenant: string) => void;
  validateTenant: (tenant: string) => Promise<boolean>;
  loading: boolean;
  initialTenant?: string;
  error?: React.ReactNode;
};

const TenantSelectorScreen = (props: Props) => {
  return (
    <AuthenticationScreen>
      <TenantSelector {...props} />
    </AuthenticationScreen>
  );
};

export default TenantSelectorScreen;
