import { PublicClientApplication } from '@azure/msal-browser';
import type { AccountInfo } from '@azure/msal-browser';

import type { AuthFlow, AuthenticatedUser } from '@cognite/auth-utils';
import { getFlow } from '@cognite/auth-utils';

const CACHE_CONFIG = {
  cacheLocation: 'localStorage',
  storeAuthStateInCookie: false,
};

type AuthFlowProvider = (props: {
  authState: AuthenticatedUser;
  directory?: string;
}) => AccountInfo | null;

export const isAuthenticated = (
  authState?: AuthenticatedUser
): authState is AuthenticatedUser &
  Pick<Required<AuthenticatedUser>, 'email' | 'project'> =>
  authState?.email !== undefined && authState.project !== undefined;

const getAuthConfig = (authState: AuthenticatedUser, directory?: string) => ({
  clientId: authState.id ?? '',
  authority: `https://login.microsoftonline.com/${directory ?? 'common/'}`,
  redirectUri: `https://${window.location.host}`,
});

const authFlows: Partial<Record<AuthFlow, AuthFlowProvider>> = {
  AZURE_AD({ authState, directory }) {
    const app = new PublicClientApplication({
      auth: getAuthConfig(authState, directory),
      cache: CACHE_CONFIG,
    });
    return app.getAccountByUsername(authState.email ?? '');
  },
};

export function getAuthenticatedUser({
  project,
  authState,
}: {
  project?: string;
  authState?: AuthenticatedUser;
}): AccountInfo | null {
  if (!authState) {
    return null;
  }

  try {
    const { flow, options } = getFlow(project);

    if (!flow || !options) {
      throw new Error('Invalid auth flow');
    }
    const account = authFlows[flow]?.({
      authState,
      directory: options.directory,
    });

    if (!account) {
      throw new Error('Could not read account');
    }
    return account;
  } catch (ex) {
    return null;
  }
}
