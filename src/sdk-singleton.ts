import { CogniteClient } from '@cognite/sdk';

import sdk, {
  getAuthState as _getAuthState,
  loginAndAuthIfNeeded as _loginAndAuthIfNeeded,
  // @ts-ignore
} from '@cognite/cdf-sdk-singleton';

export default sdk as CogniteClient;

type AuthenticationState = {
  project: string | undefined;
  projectId: number | undefined;
  tenant: string | undefined;
  username: string | undefined;
  authenticated: boolean;
};

export const getAuthState: () => AuthenticationState = _getAuthState;
export const loginAndAuthIfNeeded: (
  tenant: string,
  env: string
) => Promise<AuthenticationState> = _loginAndAuthIfNeeded;
