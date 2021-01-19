import * as React from 'react';
import {
  AuthContext,
  AuthProvider as ContainerAuthProvider,
} from '@cognite/react-container';
import Api from '../services/Api';

type Props = {
  children: any;
};

type Values = {
  api?: Api;
};

const ApiContext = React.createContext<Values>({});

const ApiProvider = ({ children }: Props) => {
  const { client, authState } = React.useContext<AuthContext>(
    ContainerAuthProvider
  );
  // @ts-ignore
  const { token } = authState || {};
  const api = new Api(token || '', client);

  return <ApiContext.Provider value={{ api }}>{children}</ApiContext.Provider>;
};

export { ApiProvider };

export default ApiContext;
