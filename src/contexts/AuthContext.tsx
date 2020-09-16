import React, { useEffect, useState } from 'react';
import config from 'utils/config';
import sdk from 'utils/cognitesdk';
import { SIDECAR } from '../utils/sidecar';

type Props = {
  children: any;
};

type AuthContextType = {
  token: string;
  user?: string;
  setUser: (nextUser: string) => void;
};

const AuthContext = React.createContext({
  token: 'NO_TOKEN',
} as AuthContextType);
const storageKey = `${SIDECAR.applicationId}/${config.app.version}/${SIDECAR.cognuitCdfProject}/auth`;

const AuthProvider = ({ children }: Props) => {
  const [token, setToken] = useState('NO_TOKEN');
  const [user, setUser] = useState<string>('');
  useEffect(() => {
    sdk.loginWithOAuth({
      project: SIDECAR.cognuitCdfProject,
      onTokens: ({ accessToken }) => {
        localStorage.setItem(storageKey, accessToken);
        setToken(accessToken);
      },
    });
    sdk.authenticate();
  }, []);

  useEffect(() => {
    if (!user || user.length <= 0) {
      (async () => {
        const status = await sdk.login.status();
        if (status && status.user) {
          setUser(status.user);
        }
      })();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const getValue = () => {
    return {
      token,
      user,
      setUser,
    };
  };

  return (
    <AuthContext.Provider value={getValue()}>{children}</AuthContext.Provider>
  );
};

export { AuthProvider };

export default AuthContext;
