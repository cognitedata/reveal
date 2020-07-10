import React, { useEffect, useState } from 'react';
import { CogniteClient } from '@cognite/sdk';
import config from '../utils/config';

type Props = {
  children: any;
};

const AuthContext = React.createContext({ token: 'NO_TOKEN' });
const storageKey = `${config.auth.appId}/${config.auth.appVersion}/${config.auth.cdfProject}/auth`;
const client = new CogniteClient({
  appId: config.auth.appId,
  baseUrl: config.auth.baseUrl,
});

const AuthProvider = ({ children }: Props) => {
  const [token, setToken] = useState('NO_TOKEN');
  useEffect(() => {
    client.loginWithOAuth({
      project: config.auth.cdfProject,
      onAuthenticate: (login) => {
        login.redirect({
          redirectUrl: `${config.app.baseUrl}/${config.auth.cdfProject}`,
          errorRedirectUrl: `${config.app.baseUrl}/${config.auth.cdfProject}/auth/error`,
        });
      },
      onTokens: ({ accessToken }) => {
        localStorage.setItem(storageKey, accessToken);
        setToken(accessToken);
      },
    });
    if (config.app.autoLogin) {
      (async () => {
        await client.authenticate();
      })();
    }
  }, []);

  return (
    <AuthContext.Provider value={{ token }}>{children}</AuthContext.Provider>
  );
};

export { AuthProvider };

export default AuthContext;
