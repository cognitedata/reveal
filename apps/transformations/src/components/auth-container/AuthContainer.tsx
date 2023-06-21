import { useUserInformation } from '@transformations/hooks';

import sdk, { loginAndAuthIfNeeded } from '@cognite/cdf-sdk-singleton';
import {
  AuthWrapper,
  SubAppWrapper,
  getEnv,
  getProject,
} from '@cognite/cdf-utilities';
import { Loader } from '@cognite/cogs.js';
import { SDKProvider } from '@cognite/sdk-provider';

type AuthContainerProps = {
  children: React.ReactNode;
};

/**
 * AuthContainer - wraps auth stuff and prepares the app
 * Isolated so that we can replace and plug-in in any env
 */
export const AuthContainer = ({ children }: AuthContainerProps) => {
  const { data: userData } = useUserInformation();
  const projectName = getProject();
  const env = getEnv() || undefined;

  return (
    <SubAppWrapper title="Transform Data" userId={userData?.id}>
      <AuthWrapper
        loadingScreen={<Loader />}
        login={() => loginAndAuthIfNeeded(projectName, env)}
      >
        <SDKProvider sdk={sdk}>{children}</SDKProvider>
      </AuthWrapper>
    </SubAppWrapper>
  );
};
