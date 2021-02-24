import * as React from 'react';
import { CogniteClient } from '@cognite/sdk';
import { CogniteAuth, AuthenticatedUser, getFlow } from '@cognite/auth-utils';
import { Loader } from '@cognite/cogs.js';
import { SidecarConfig } from '@cognite/react-tenant-selector';

import { log } from '../utils';

export interface AuthContext {
  client?: CogniteClient;
  authState?: AuthenticatedUser;
  initialized?: Promise<unknown>;
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
  const [authState, setAuthState] = React.useState<AuthContext | undefined>();
  const [loading, setLoading] = React.useState(true);
  const { flow } = getFlow();

  const { aadApplicationId, AADTenantID, applicationId, cdfCluster } = sidecar;

  React.useEffect(() => {
    const authClient = new CogniteAuth(sdkClient, {
      aad: { appId: aadApplicationId || '', directoryTenantId: AADTenantID },
      cluster: cdfCluster,
    });

    log('[AuthContainer] CogniteAuth:', [authClient], 1);

    const flowToUse = flow || authClient.state.authResult?.authFlow;

    if (authClient.initializingPromise && flowToUse) {
      authClient.initializingPromise.then(() => {
        authClient.loginAndAuthIfNeeded(flowToUse, tenant, cdfCluster);
      });
    }

    const unsubscribe = authClient.onAuthChanged(
      applicationId,
      (authResponse: AuthenticatedUser) => {
        if (!authClient.state.initializing) {
          log('[AuthContainer] onAuthChanged authResponse', [authResponse], 1);
          log(
            '[AuthContainer] onAuthChanged authClient.state',
            [authClient.state],
            1
          );
          setAuthState({
            initialized: authClient.initializingPromise,
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

  React.useEffect(() => {
    log(
      '[AuthContainer] State info:',
      [{ tenant, authState: authState?.authState, sdkClient }],
      1
    );

    if (flow === 'COGNITE_AUTH') {
      setLoading(false);
      return;
    }

    if (authState?.authState?.authenticated) {
      setLoading(false);
    } else {
      log(
        '[AuthContainer] UnAuthenticated state found, going to login page.',
        [authState],
        2
      );
      if (authState?.initialized && authError) {
        authState.initialized.then(() => {
          authError();
        });
      }
    }
  }, [authState]);

  log(
    '[AuthContainer] Render gates:',
    [
      {
        loading,
        authenticated: authState?.authState?.authenticated,
      },
    ],
    1
  );

  if (loading || !authState) {
    return <Loader />;
  }

  return (
    <AuthProvider.Provider value={authState}>{children}</AuthProvider.Provider>
  );
};

type AuthContainerForApiKeyModeProps = Exclude<
  AuthContainerProps,
  'AuthError' | 'sidecar'
>;
export const AuthContainerForApiKeyMode: React.FC<AuthContainerForApiKeyModeProps> = ({
  sdkClient,
  tenant,
  children,
}) => {
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
