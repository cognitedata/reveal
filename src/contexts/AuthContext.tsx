import * as React from 'react';

// can delete this file

type AuthContextType = {
  token: string;
  user?: string;
  setUser: (nextUser: string) => void;
  authenticating: boolean;
  setAuthenticating: (nextState: boolean) => void;
};

const AuthContextOld = React.createContext({
  token: 'NO_TOKEN',
} as AuthContextType);

export default AuthContextOld;
