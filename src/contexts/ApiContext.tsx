import React from 'react';
import config from 'utils/config';

type ApiProviderProps = {
  children: React.ReactNode;
};

export type ApiContextProps = {
  getHello: () => Promise<{ msg: string }>;
  objects: {
    getAll: () => Promise<any>;
  };
} | null;

const headers = {
  'Access-Control-Allow-Origin': '*',
  'api-key': config.api.key,
};

const ApiContext = React.createContext<ApiContextProps>(null);

export const ApiProvider = ({ children }: ApiProviderProps) => {
  async function getHello(): Promise<{ msg: string }> {
    const response = await fetch(`${config.api.url}/hello`, {
      method: 'GET',
      headers,
    });
    return response.json();
  }

  const objects = {
    async getAll(): Promise<any> {
      const response = await fetch(
        `${config.api.url}${config.api.project}/objects`,
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
