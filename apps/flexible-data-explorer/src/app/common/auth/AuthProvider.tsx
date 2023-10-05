import type { FC, PropsWithChildren } from 'react';
import { createContext, useContext } from 'react';

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

export const AuthProvider: FC<PropsWithChildren<Props>> = () => {
  return <p>To be fixed</p>;
};

export const useAuthContext = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context) {
    // we never even render context if it is not for already authenticated user, so we do manual type narrowing here
    return context;
  }
  throw new Error('useAuthContext must be used within an AuthProvider');
};
