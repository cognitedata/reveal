import * as React from 'react';
import { CogniteClient } from '@cognite/sdk';
import { CogniteAuth, AuthenticatedUser } from '@cognite/auth-utils';
import { Loader } from '@cognite/cogs.js';

import { getClusterFromCdfApiBaseUrl } from 'utils/cluster';
import { getSidecar, log } from '../utils';

export interface AuthContext {
  client?: CogniteClient;
  authState?: AuthenticatedUser;
}

// exporting so users can also directly do:
//
// const {...} = useContext(AuthProvider)
//
export const AuthProvider = React.createContext<AuthContext>({});
export const AuthConsumer = AuthProvider.Consumer;
export type EnabledModes = {
  cognite?: boolean;
  adfs?: boolean;
  aad?: boolean;
};
interface AuthContainerProps {
  sdkClient: CogniteClient;
  tenant: string;
  children: React.ReactNode;
}
export const AuthContainer: React.FC<AuthContainerProps> = ({
  sdkClient,
  tenant,
  children,
}: AuthContainerProps) => {
  const [authState, setAuthState] = React.useState<AuthContext | undefined>();

  const {
    AADClientID,
    AADTenantID,
    applicationId,
    cdfApiBaseUrl,
  } = getSidecar();

  const cluster = getClusterFromCdfApiBaseUrl(cdfApiBaseUrl);

  React.useEffect(() => {
    const authClient = new CogniteAuth(sdkClient, {
      azureAdClientId: AADClientID,
      azureAdTenantId: AADTenantID,
      cluster,
    });

    log('[AuthContainer] Main Auth client:', [authClient], 1);

    if (authClient.initializingPromise) {
      authClient.initializingPromise.then(() => {
        authClient.loginAndAuthIfNeeded(tenant, cluster);
      });
    }

    const unsubscribe = authClient.onAuthChanged(
      applicationId,
      (authResponse: AuthenticatedUser) => {
        if (!authClient.state.initializing) {
          log('[AuthContainer] setting AuthState', [], 1);
          setAuthState({
            client: authClient.getClient(),
            authState: authResponse,
          });
        }
      }
    );

    return () => {
      unsubscribe();
    };
  }, []);

  const hasBeenLoggedIn = !!authState?.authState?.username;

  log(
    '[AuthContainer] State info:',
    [{ tenant, authState: authState?.authState, sdkClient }],
    1
  );
  log(
    '[AuthContainer] Render gates:',
    [
      {
        authenticated: authState?.authState?.authenticated,
        loggedin: hasBeenLoggedIn,
      },
    ],
    1
  );

  if (!authState?.authState?.authenticated || !hasBeenLoggedIn) {
    return <Loader />;
  }

  return (
    <AuthProvider.Provider value={authState}>{children}</AuthProvider.Provider>
  );
};

export const AuthContainerForApiKeyMode: React.FC<AuthContainerProps> = ({
  sdkClient,
  tenant,
  children,
}: AuthContainerProps) => {
  return (
    <AuthProvider.Provider
      value={{
        client: sdkClient,
        authState: {
          tenant,
          authenticated: true,
          initialising: false,
        },
      }}
    >
      {children}
    </AuthProvider.Provider>
  );
};
