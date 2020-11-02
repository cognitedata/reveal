import React, { PropsWithChildren, useContext } from 'react';

interface ContextProps {
  project: string | null;
  cdfEnv: string | undefined;
}

const AppEnvContext = React.createContext<ContextProps>({
  project: null,
  cdfEnv: undefined,
});

const AppEnvProvider = ({
  project,
  cdfEnv,
  children,
}: PropsWithChildren<ContextProps>) => {
  return (
    <AppEnvContext.Provider value={{ project, cdfEnv }}>
      {children}
    </AppEnvContext.Provider>
  );
};

const useAppEnv = () => {
  const appEnv = useContext(AppEnvContext);
  if (appEnv === undefined) {
    throw new Error('You can not use client context with out ClientProvider');
  }
  return appEnv;
};

export { AppEnvContext, AppEnvProvider, useAppEnv };
