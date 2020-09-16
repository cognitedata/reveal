import React, { useEffect, useState } from 'react';
import { CogniteClient } from '@cognite/sdk';
import { SIDECAR } from '../utils/sidecar';
import config from '../utils/config';

type Props = {
  children: any;
};

const AuthContext = React.createContext({ token: 'NO_TOKEN' });
const storageKey = `${SIDECAR.applicationId}/${config.app.version}/${SIDECAR.cognuitCdfProject}/auth`;
const client = new CogniteClient({
  appId: SIDECAR.applicationId,
  baseUrl: 'https://api.cognitedata.com',
});

const AuthProvider = ({ children }: Props) => {
  const [token, setToken] = useState('NO_TOKEN');
  useEffect(() => {
    client.loginWithOAuth({
      project: SIDECAR.cognuitCdfProject,
      onTokens: ({ accessToken }) => {
        localStorage.setItem(storageKey, accessToken);
        setToken(accessToken);
      },
    });
    client.authenticate();
  }, []);

  return (
    <AuthContext.Provider value={{ token }}>{children}</AuthContext.Provider>
  );
};

export { AuthProvider };

export default AuthContext;
