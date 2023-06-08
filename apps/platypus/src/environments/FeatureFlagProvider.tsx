import { PropsWithChildren } from 'react';

import { getEnvironment } from '@platypus-app/utils/environment-utils';
import sidecar from '@platypus-app/utils/sidecar';

import { getProject } from '@cognite/cdf-utilities';
import { FlagProvider } from '@cognite/react-feature-flags';

export const FeatureFlagProvider: React.FC<PropsWithChildren> = ({
  children,
}) => {
  return (
    <FlagProvider
      projectName={getProject()}
      appName={`${getProject()}-${getEnvironment()}`}
      apiToken={sidecar.unleash}
      remoteAddress={window.location.hostname}
    >
      {children}
    </FlagProvider>
  );
};
