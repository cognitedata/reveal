import * as React from 'react';
import { CogniteClient } from '@cognite/sdk';
import { CogniteAuth, AuthenticatedUser } from '@cognite/auth-utils';
import { Loader } from '@cognite/cogs.js';

import { getClusterFromCdfApiBaseUrl } from 'utils/cluster';
import { getSidecar } from '../utils';

export interface AuthContext {
  client?: CogniteClient;
  authState?: AuthenticatedUser;
}
const AuthProvider = React.createContext<AuthContext>({});

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
    let msalConfig;

    if (AADClientID) {
      msalConfig = {
        auth: {
          authority:
            // 'https://login.microsoftonline.com/common',
            // 'https://login.microsoftonline.com/organizations',
            `https://login.microsoftonline.com/${AADTenantID}`,
          clientId: AADClientID,
          redirectUri: `${window.location.origin}`,
        },
      };
    }

    const authClient = new CogniteAuth(sdkClient, {
      msalConfig,
      cluster,
      // cluster: getCluster(appsApiBaseUrl),
    });

    if (authClient.initializingPromise) {
      authClient.initializingPromise.then(() => {
        authClient.loginAndAuthIfNeeded(tenant, cluster);
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        // authClient.listProjects().then((result) => {
        //   console.log('The client can see the following projects:', result);
        // });
      });
    }

    const unsubscribe = authClient.onAuthChanged(
      applicationId,
      (authResponse: AuthenticatedUser) => {
        if (!authClient.state.initializing) {
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

  // console.log('[AuthContainer] State info:', { tenant, authState, sdkClient });
  // console.log('[AuthContainer] Render gates:', {
  //   authenticated: authState?.authState?.authenticated,
  //   // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //   // @ts-ignore
  //   loggedin: sdkClient.hasBeenLoggedIn,
  // });

  if (
    !authState?.authState?.authenticated ||
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    !authState.client.hasBeenLoggedIn
  ) {
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
