import React, {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useContext,
  useState,
} from 'react';

import { getSelectedIdpDetails } from '@cognite/login-utils';

type LoginPageState = {
  isHandledAADRedirect: boolean;
  setIsHandledAADRedirect: Dispatch<SetStateAction<boolean>>;
};

export const LoginPageContext = createContext<LoginPageState>(
  {} as LoginPageState
);

export const useLoginPageContext = () => useContext(LoginPageContext);

type LoginPageProviderProps = {
  children: ReactNode;
};

export const LoginPageProvider = ({ children }: LoginPageProviderProps) => {
  const [isHandledAADRedirect, setIsHandledAADRedirect] = useState(() => {
    const { type } = getSelectedIdpDetails() ?? {};
    return type === 'AZURE_AD' ? false : true;
  });

  return (
    <LoginPageContext.Provider
      value={{
        isHandledAADRedirect,
        setIsHandledAADRedirect,
      }}
    >
      {children}
    </LoginPageContext.Provider>
  );
};
