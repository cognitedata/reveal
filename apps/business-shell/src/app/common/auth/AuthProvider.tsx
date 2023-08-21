import type { FC, PropsWithChildren } from 'react';

import * as AuthPackage from '@cognite/e2e-auth';
import { CogniteClient } from '@cognite/sdk';

import { AuthStateAuthenticated, AuthStateUser } from './types';

export type AuthContextType = {
  client: CogniteClient;
  authState: AuthStateAuthenticated;
  logout: () => void;
  loginWithCustomerId: (customerId: string) => void;
};

type Props = {
  appId?: string;
  mock?: {
    client?: CogniteClient;
    user?: AuthStateUser;
  };
};

export const AuthProvider: FC<PropsWithChildren<Props>> = (props) => {
  return (
    <AuthPackage.AuthProvider useProductionAadApp={false} appName="FDX">
      {props.children}
    </AuthPackage.AuthProvider>
  );
};

export const useAuthContext = (): AuthContextType => {
  const context = AuthPackage.useAuthContext();
  if (context) {
    // we never even render context if it is not for already authenticated user, so we do manual type narrowing here
    return context;
  }
  throw new Error('useAuthContext must be used within an AuthProvider');
};
