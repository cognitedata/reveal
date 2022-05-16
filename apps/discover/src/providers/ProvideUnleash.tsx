import { getTenantInfo } from '@cognite/react-container';
import { FlagProvider } from '@cognite/react-feature-flags';

import { SIDECAR } from 'constants/app';

export const ProvideUnleash: React.FC<
  React.ReactElement<any, string | React.JSXElementConstructor<any>>
> = (children) => {
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
