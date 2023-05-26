import { PropsWithChildren } from 'react';

import { getEnvironment } from '@platypus-app/utils/environment-utils';
import sidecar from '@platypus-app/utils/sidecar';
import { getTenant } from '@platypus-app/utils/tenant-utils';

import { getProject } from '@cognite/cdf-utilities';
import { FlagProvider } from '@cognite/react-feature-flags';

export const FeatureFlagProvider: React.FC<PropsWithChildren> = ({
  children,
}) => {
  return (
    <FlagProvider
      projectName={getProject()}
      appName={`${getTenant()}-${getEnvironment()}`}
      apiToken={sidecar.unleash}
      remoteAddress={window.location.hostname}
    >
      {children}
    </FlagProvider>
  );
};
