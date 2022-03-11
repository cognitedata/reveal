import { useEffect } from 'react';
import * as React from 'react';
import { useQueryClient } from 'react-query';
import { AuthenticatedUser } from '@cognite/auth-utils';
import { Loader } from '@cognite/cogs.js';
import { CogniteClient } from '@cognite/sdk';
import { SidecarConfig } from '@cognite/sidecar';

import { setCogniteSDKClient } from '../../internal';
import { log } from '../../utils';
import { syncUser } from '../../utils/userManagementSync';

import { TokenFactory } from './TokenFactory';
import { getProjectSpecificFlow } from './utils';

export interface AuthContext {
  client?: CogniteClient;
  authState?: AuthenticatedUser;
  reauthenticate?: () => void;
}

export const AuthProvider = React.createContext<AuthContext>({});
export const useAuthContext = () => React.useContext(AuthProvider);
export const AuthConsumer = AuthProvider.Consumer;

interface AuthContainerProps {
  authError: () => void;
  project: string;
  sidecar: SidecarConfig;
  children: React.ReactNode;
}
export const AuthContainer: React.FC<AuthContainerProps> = ({
  authError,
  project,
  sidecar,
  children,
}) => {
  const [authResponse, setAuthState] = React.useState<
    AuthContext | undefined
  >();
  const [loading, setLoading] = React.useState(true);
  const projectFlow = getProjectSpecificFlow(project);
  const queryClient = useQueryClient();
  const {
    aadApplicationId,
    applicationId,
    cdfApiBaseUrl,
    fakeIdp,
    aadCdfScopes,
    AADTenantID,
  } = sidecar;

  useEffect(() => {
    // Here we authenticate the client and set the state
    if (projectFlow) {
      const tokenFactory = new TokenFactory({
        flow: projectFlow?.flow,
        project,
        baseUrl: cdfApiBaseUrl,
        aadApplicationId,
        fakeIdp,
        cdfScopes: aadCdfScopes,
        aadTenantId: projectFlow.options?.directory || AADTenantID,
      });

      const sdkClient = new CogniteClient({
        appId: applicationId,
        baseUrl: cdfApiBaseUrl,
        project,
        getToken: tokenFactory.getToken(),
      });

      sdkClient
        .authenticate()
        .then((accessToken) => {
          if (accessToken) {
            setAuthState({
              authState: {
                project,
                initialising: false,
                error: undefined,
                authenticated: true,
                token: accessToken,
                idToken: tokenFactory.idToken,
                email: tokenFactory.email,
              },
              client: sdkClient,
              reauthenticate,
            });
            setCogniteSDKClient(sdkClient);
            syncUser(accessToken, tokenFactory.idToken, sidecar);
          } else {
            // if the accessToken is '' or undefined it means there was something wrong
            authError();
          }
          setLoading(false);
        })
        .catch((err) => {
          setAuthState({
            authState: {
              initialising: false,
              project,
              error: true,
              authenticated: false,
              errorMessage: err.toString(),
            },
            client: sdkClient,
            reauthenticate,
          });
          setLoading(false);
          authError();
        });

      // custom re-authentication that we can trigger from outside for example when calls that are not using the cdfClient fail on 401
      // this way we trigger a re-auth, get new keys and set them in state
      const reauthenticate = () => {
        sdkClient.authenticate().then((accessToken) => {
          // We only reset the tokens, no need to init a new client
          setAuthState((prevState) => {
            return {
              ...prevState,
              authState: prevState?.authState
                ? {
                    ...prevState?.authState,
                    token: accessToken,
                    idToken: tokenFactory.idToken,
                  }
                : prevState?.authState,
            };
          });

          // This will remove current fetching queries that have the old token,
          // then they will be re-created and use the new token
          queryClient.removeQueries({ fetching: true });
        });
      };
    }
  }, []);

  if (!projectFlow) {
    // eslint-disable-next-line no-console
    console.error(`Missing auth flow for project: ${project}`);
    authError();
  }

  if (loading) {
    log('[AuthContainer] Loading from react-container', [], 1);
    return <Loader />;
  }

  if (!authResponse) {
    // console.log(
    //   'This should never happen, but it's a guard for the below render'
    // );
    return <Loader />;
  }

  return (
    <AuthProvider.Provider value={authResponse}>
      {children}
    </AuthProvider.Provider>
  );
};
