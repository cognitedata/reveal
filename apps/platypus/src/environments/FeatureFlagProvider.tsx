import { PropsWithChildren } from 'react';
import { FlagProvider } from '@cognite/react-feature-flags';
import { getProject } from '@cognite/cdf-utilities';
import sidecar from '@platypus-app/utils/sidecar';
import { getTenant } from '@platypus-app/utils/tenant-utils';
import { getEnvironment } from '@platypus-app/utils/environment-utils';

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
