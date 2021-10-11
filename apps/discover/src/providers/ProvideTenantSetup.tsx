import * as React from 'react';

import { useTenantConfig } from 'hooks/useTenantConfig';

export const ProvideTenantSetup: React.FC = ({ children }) => {
  useTenantConfig(); // initialize the tenant config.
  return <>{children}</>;
};
