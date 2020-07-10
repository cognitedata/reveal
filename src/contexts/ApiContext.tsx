import React, { useContext } from 'react';
import Api from '../services/Api';
import AuthContext from './AuthContext';

type Props = {
  children: any;
};

type Values = {
  api?: Api;
};

const ApiContext = React.createContext<Values>({});

const ApiProvider = ({ children }: Props) => {
  const { token } = useContext(AuthContext);
  const api = new Api(token);
  return <ApiContext.Provider value={{ api }}>{children}</ApiContext.Provider>;
};

export { ApiProvider };

export default ApiContext;
