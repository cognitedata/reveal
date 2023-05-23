import React, { createContext, ReactNode, useContext } from 'react';

// eslint-disable-next-line @typescript-eslint/ban-types
type LoginUtilState = {};

export const LoginUtilContext = createContext<LoginUtilState>(
  {} as LoginUtilState
);

export const useLoginUtilContext = () => useContext(LoginUtilContext);

type LoginUtilProviderProps = {
  children: ReactNode;
};

export const LoginUtilProvider = ({ children }: LoginUtilProviderProps) => {
  return (
    <LoginUtilContext.Provider value={{}}>{children}</LoginUtilContext.Provider>
  );
};
