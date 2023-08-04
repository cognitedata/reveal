import { PropsWithChildren } from 'react';

import { getEnvironment } from '@platypus-app/utils/environment-utils';

import { getProject } from '@cognite/cdf-utilities';
import { FlagProvider } from '@cognite/react-feature-flags';

export const FeatureFlagProvider: React.FC<PropsWithChildren> = ({
  children,
}) => {
  const unleashToken = 'v2Qyg7YqvhyAMCRMbDmy1qA6SuG8YCBE';
  return (
    <FlagProvider
      projectName={getProject()}
      appName={`${getProject()}-${getEnvironment()}`}
      apiToken={unleashToken}
      remoteAddress={window.location.hostname}
    >
      {children}
    </FlagProvider>
  );
};
