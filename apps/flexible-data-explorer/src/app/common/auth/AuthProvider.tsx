import type { FC, PropsWithChildren } from 'react';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  AuthProvider as UnifiedSigninAuthProvider,
  useAuth,
} from '@cognite/auth-react';
import { Icon } from '@cognite/cogs.js';
import { CogniteClient } from '@cognite/sdk';

import { AuthStateAuthenticated, AuthStateUser } from './types';

export type AuthContextType = {
  client: CogniteClient;
  authState: AuthStateAuthenticated;
  logout: () => void;
  loginWithCustomerId: (customerId: string) => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

type Props = {
  appId?: string;
  mock?: {
    client?: CogniteClient;
    user?: AuthStateUser;
  };
};
const InnerAuthProvider: FC<PropsWithChildren<Props>> = ({
  children,
  mock,
  appId = 'fdx',
}) => {
  const { getUser, project, getToken, logout, cluster } = useAuth();

  const [isFetchingAuthState, setIsFetchingAuthState] =
    useState<boolean>(false);
  const [newAuthState, setAuthState] = useState<
    AuthStateAuthenticated & { client: CogniteClient }
  >();

  const client = useMemo(
    () =>
      mock?.client ||
      new CogniteClient({
        appId,
        baseUrl: `https://${cluster}`,
        project,
        getToken: async () =>
          getToken().then((token: string) => {
            return token || 'nothing';
          }),
      }),
    [appId, getToken, mock?.client, project, cluster]
  );

  const fetchAuthState = useCallback(async (): Promise<
    AuthStateAuthenticated & { client: CogniteClient }
  > => {
    const user = await getUser();
    if (!user?.email || !user?.id) throw new Error('Invalid user');

    if (!user.preferred_username || !user.name) {
      throw new Error('User does not have a name');
    }

    return {
      status: 'AUTHENTICATED',
      user: mock?.user || {
        email: user.email,
        id: user.id,
        name: user.preferred_username || user.name,
        idToken: '',
      },
      client,
    };
  }, [client, getUser, mock]);

  useEffect(() => {
    if (newAuthState) return;
    if (isFetchingAuthState) return;
    setIsFetchingAuthState(true);
    fetchAuthState().then(setAuthState);
  }, [fetchAuthState, getToken, isFetchingAuthState, newAuthState]);

  const authContext:
    | (Omit<AuthContextType, 'authState' | 'login'> & {
        authState: AuthStateAuthenticated;
      })
    | null = useMemo(
    () =>
      newAuthState
        ? {
            client: newAuthState.client,
            authState: newAuthState,
            logout,
            loginWithCustomerId: () => null,
          }
        : null,
    [newAuthState, logout]
  );

  if (authContext == null) {
    return null;
  }

  return (
    <AuthContext.Provider value={authContext as AuthContextType}>
      {children}
    </AuthContext.Provider>
  );
};

export const AuthProvider: FC<PropsWithChildren<Props>> = (props) => {
  return (
    <UnifiedSigninAuthProvider loader={<Icon type="Loader" />}>
      <InnerAuthProvider {...props}>{props.children}</InnerAuthProvider>
    </UnifiedSigninAuthProvider>
  );
};

export const useAuthContext = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context) {
    // we never even render context if it is not for already authenticated user, so we do manual type narrowing here
    return context;
  }
  throw new Error('useAuthContext must be used within an AuthProvider');
};
