import * as React from 'react';
import { CogniteAuth, AuthenticatedUser, getFlow } from '@cognite/auth-utils';
import { Loader } from '@cognite/cogs.js';
import { SidecarConfig } from '@cognite/react-tenant-selector';
import type { CogniteClient } from '@cognite/sdk';

import { log } from '../utils';

export interface AuthContext {
  client?: CogniteClient;
  authState?: AuthenticatedUser;
  initialized?: Promise<unknown>;
  reauthenticate?: () => Promise<unknown>;
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
  authError: () => void;
  sdkClient: CogniteClient;
  tenant: string;
  sidecar: SidecarConfig;
  children: React.ReactNode;
}
export const AuthContainer: React.FC<AuthContainerProps> = ({
  authError,
  sdkClient,
  tenant,
  sidecar,
  children,
}) => {
  const [authResponse, setAuthState] = React.useState<
    AuthContext | undefined
  >();
  const [loading, setLoading] = React.useState(true);
  const { flow } = getFlow();

  const { aadApplicationId, AADTenantID, applicationId, cdfCluster } = sidecar;

  React.useEffect(() => {
    let aad;
    if (aadApplicationId) {
      aad = { appId: aadApplicationId || '', directoryTenantId: AADTenantID };
    }

    const authClient = new CogniteAuth(sdkClient, {
      aad,
      appName: applicationId,
      cluster: cdfCluster,
      flow,
    });

    log('[AuthContainer] CogniteAuth:', [authClient], 1);
    const flowToUse = flow || authClient.state.authResult?.authFlow;
    log('[AuthContainer] Using flow:', [flowToUse], 1);

    const unsubscribe = authClient.onAuthChanged(
      applicationId,
      (authenticatedUser: AuthenticatedUser) => {
        if (!authClient.state.initializing) {
          log('[AuthContainer] onAuthChanged authResponse', [authResponse], 1);
          log(
            '[AuthContainer] onAuthChanged authClient.state',
            [authClient.state],
            1
          );
          setAuthState({
            client: authClient.getClient(),
            authState: authenticatedUser,
            reauthenticate: () => {
              if (authenticatedUser.project) {
                return authClient.loginAndAuthIfNeeded({
                  project: authenticatedUser.project,
                });
              }

              return Promise.reject(
                new Error('No project set, can not re-auth')
              );
            },
          });
          setLoading(false);
        }
      }
    );

    if (flowToUse) {
      authClient.loginAndAuthIfNeeded({ flow: flowToUse, project: tenant });
    }

    return () => {
      unsubscribe();
    };
  }, []);

  // this effect handles errors and stops loading after response changes.
  React.useEffect(() => {
    log(
      '[AuthContainer] State info:',
      [
        {
          tenant,
          authResponse: authResponse?.authState,
          flow,
        },
      ],
      1
    );

    if (flow && ['COGNITE_AUTH', 'FAKE_IDP'].includes(flow)) {
      setLoading(false);
    }

    if (authResponse?.authState?.authenticated) {
      setLoading(false);
    }

    if (authResponse?.authState?.error) {
      log(
        '[AuthContainer] Error found, going to login page.',
        [authResponse?.authState?.errorMessage],
        2
      );
      authError();
    }
  }, [authResponse]);

  log(
    '[AuthContainer] Render gates:',
    [
      {
        loading,
        authResponse,
        authenticated: authResponse?.authState?.authenticated,
      },
    ],
    1
  );

  if (loading) {
    log('[AuthContainer] Loading from react-container', [], 1);
    return <Loader />;
  }

  if (!authResponse) {
    // console.log(
    //   'This should never happen, but its a guard for the below render'
    // );
    return <Loader />;
  }

  return (
    <AuthProvider.Provider value={authResponse}>
      {children}
    </AuthProvider.Provider>
  );
};

// this containers job is the same,
// but without triggering an auth call at the start
// (so it assumes you are already logged in via some other method)
type AuthContainerForApiKeyModeProps = Exclude<
  AuthContainerProps,
  'AuthError' | 'sidecar'
>;
export const AuthContainerForApiKeyMode: React.FC<AuthContainerForApiKeyModeProps> =
  ({ sdkClient, tenant, children }) => (
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
