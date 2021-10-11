import { getTenantInfo } from '@cognite/react-container';
import { FlagProvider } from '@cognite/react-feature-flags';

import { SIDECAR } from 'constants/app';

export const ProvideUnleash: React.FC = (children) => {
  const [tenant] = getTenantInfo();
  return (
    <FlagProvider
      projectName={tenant}
      appName="discover-app"
      apiToken={SIDECAR.unleash}
    >
      {children}
    </FlagProvider>
  );
};
