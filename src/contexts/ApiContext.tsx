import React from 'react';
import config from 'utils/config';

type ApiProviderProps = {
  children: React.ReactNode;
};

export type ApiContextType = {
  getHello: () => Promise<{ msg: string }>;
  objects: {
    get: () => Promise<any>;
  };
};

const headers = {
  'Access-Control-Allow-Origin': '*',
  'api-key': config.api.key,
};

const ApiContext = React.createContext<ApiContextType>(undefined!);

export const ApiProvider = ({ children }: ApiProviderProps) => {
  async function getHello(): Promise<{ msg: string }> {
    const response = await fetch(`${config.api.url}/hello`, {
      method: 'GET',
      headers,
    });
    return response.json();
  }

  const objects = {
    async get(
      skip: number = 0,
      limit: number = 3000,
      include_related: boolean = false
    ): Promise<any> {
      const queryParams = new URLSearchParams();
      queryParams.set('skip', skip.toString());
      queryParams.set('limit', limit.toString());
      queryParams.set('include_related', include_related.toString());
      const response = await fetch(
        `${config.api.url}${
          config.api.project
        }/objects?${queryParams.toString()}`,
        {
          method: 'GET',
          headers,
        }
      );
      return response.json();
    },
  };

  return (
    <ApiContext.Provider value={{ getHello, objects }}>
      {children}
    </ApiContext.Provider>
  );
};

export default ApiContext;
