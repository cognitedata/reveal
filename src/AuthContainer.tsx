import sdk, {
  loginAndAuthIfNeeded,
  getFlow,
  getUserInformation,
} from '@cognite/cdf-sdk-singleton';
import { AuthWrapper, getEnv, getProject } from '@cognite/cdf-utilities';
import { Loader } from '@cognite/cogs.js';
import { SDKProvider } from '@cognite/sdk-provider';
import {
  setFlow,
  setCogniteSDKClient,
  setUserInformation,
} from './utils/cogniteSdk';

type AuthContainerProps = {
  children: React.ReactNode;
};

export const AuthContainer = ({ children }: AuthContainerProps) => {
  const projectName = getProject();
  const env = getEnv();
  setCogniteSDKClient(sdk);
  setFlow(getFlow());
  setUserInformation(getUserInformation());

  return (
    <AuthWrapper
      loadingScreen={<Loader />}
      login={() => loginAndAuthIfNeeded(projectName, env)}
    >
      <SDKProvider sdk={sdk}>{children}</SDKProvider>
    </AuthWrapper>
  );
};
