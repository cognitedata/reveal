import { CogniteClient } from '@cognite/sdk';
import React, { FC, useEffect, useMemo } from 'react';
import { useAuthContext } from '@cognite/react-container';
import { setCogniteSDKClient } from 'utils/sdk';
import BlueprintService from 'service/blueprint.service';

export type AuthenticatedUser = {
  authenticated: boolean;
  initialising: boolean;
  project?: string;
  tenant?: string;
  token?: string;
  idToken?: string;
  error?: boolean;
  errorMessage?: string;
  username?: string;
  email?: string;
  id?: string;
};

const DEFAULT_AUTH_STATE = {
  authenticated: false,
  initialising: false,
};

export const AuthContext = React.createContext<{
  client: CogniteClient;
  authState?: AuthenticatedUser;
  blueprintService?: BlueprintService;
}>({
  client: new CogniteClient({
    appId: 'No auth',
    project: '',
    getToken: () => Promise.resolve(''),
  }),
  authState: DEFAULT_AUTH_STATE,
});

export interface AuthProviderProps {
  mockClient?: CogniteClient;
  children: React.ReactNode;
}

export const AuthProvider: FC<AuthProviderProps> = ({
  mockClient,
  children,
}) => {
  const { client, authState } = useAuthContext();

  useEffect(() => {
    setCogniteSDKClient(mockClient || client!);
  }, [client]);

  const blueprintService = useMemo(() => {
    if (client) {
      return new BlueprintService(client, {
        uid: authState?.id,
        email: authState?.email,
      });
    }

    return undefined;
  }, [client, authState]);

  const value = useMemo(() => {
    return {
      client: mockClient || client!,
      authState,
      blueprintService,
    };
  }, [client, mockClient, authState, blueprintService]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
