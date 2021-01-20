import * as React from 'react';
import { AuthConsumer, AuthContext } from '@cognite/react-container';
import Api from '../services/Api';

type Props = {
  children: any;
};

export type APIContextValue = {
  api?: Api;
};

const ApiContext = React.createContext<APIContextValue>({});

const ApiProvider = ({ children }: Props) => (
  <AuthConsumer>
    {({ client, authState }: AuthContext) => {
      const { token } = authState || {};
      const api = new Api(token || '', client);
      return (
        <ApiContext.Provider value={{ api }}>{children}</ApiContext.Provider>
      );
    }}
  </AuthConsumer>
);

export { ApiProvider };

export default ApiContext;
