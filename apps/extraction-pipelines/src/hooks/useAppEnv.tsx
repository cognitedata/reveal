import React, { PropsWithChildren, useContext } from 'react';

interface ContextProps {
  project: string | null;
  origin: string | undefined;
  cdfEnv: string | undefined;
}

const AppEnvContext = React.createContext<ContextProps>({
  project: null,
  cdfEnv: undefined,
  origin: undefined,
});

const AppEnvProvider = ({
  project,
  cdfEnv,
  origin,
  children,
}: PropsWithChildren<ContextProps>) => {
  return (
    <AppEnvContext.Provider value={{ project, cdfEnv, origin }}>
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
