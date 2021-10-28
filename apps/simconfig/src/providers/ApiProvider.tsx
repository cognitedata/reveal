import React from 'react';
import { AuthenticatedUser } from '@cognite/auth-utils';
import { Api } from '@cognite/simconfig-api-sdk';
import sidecar from 'utils/sidecar';

interface ContextProps {
  api: Api<unknown>;
}

const defaultApi = new Api({
  baseURL: sidecar.simconfigApiBaseUrl,
});

export const ApiContext = React.createContext<ContextProps>({
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
