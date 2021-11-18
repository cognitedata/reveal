import React from 'react';
import { AuthenticatedUser } from '@cognite/auth-utils';
import { Api } from '@cognite/simconfig-api-sdk';
import sidecar from 'utils/sidecar';

interface ContextProps {
  project: 'cognite-simulator-integration';
  api: Api<unknown>;
}

const defaultApi = new Api({
  baseURL: sidecar.simconfigApiBaseUrl,
});

export const ApiContext = React.createContext<ContextProps>({
  // XXX should reference SDK definition
  project: 'cognite-simulator-integration',
  api: defaultApi,
});

export interface ApiProviderProps {
  children: React.ReactNode;
  authState?: AuthenticatedUser;
}

export function ApiProvider({ children, authState }: ApiProviderProps) {
  return (
    <ApiContext.Provider
      value={{
        project: 'cognite-simulator-integration',
        api: new Api({
          baseURL: sidecar.simconfigApiBaseUrl,
          headers: {
            Authorization: `Bearer ${authState?.token}`,
          },
        }),
      }}
    >
      {children}
    </ApiContext.Provider>
  );
}
