import React, { PropsWithChildren, useContext, useState } from 'react';
import { RegisterIntegrationInfo } from '../model/Integration';

interface ContextProps {
  storedIntegration: Partial<RegisterIntegrationInfo> | null;
  setStoredIntegration: (integration: Partial<RegisterIntegrationInfo>) => void;
}

const RegisterIntegrationContext = React.createContext<
  ContextProps | undefined
>(undefined);

interface Props {
  initIntegration?: Partial<RegisterIntegrationInfo>;
}

const RegisterIntegrationProvider = ({
  initIntegration,
  children,
}: PropsWithChildren<Props>) => {
  const [
    storedIntegration,
    setIntegration,
  ] = useState<Partial<RegisterIntegrationInfo> | null>(
    initIntegration ?? null
  );
  return (
    <RegisterIntegrationContext.Provider
      value={{ storedIntegration, setStoredIntegration: setIntegration }}
    >
      {children}
    </RegisterIntegrationContext.Provider>
  );
};

const useStoredRegisterIntegration = () => {
  const context = useContext(RegisterIntegrationContext);
  if (context === undefined) {
    throw new Error(
      'You can not RegisterIntegrationContext context with out RegisterIntegrationProvider'
    );
  }
  return context;
};

export {
  RegisterIntegrationContext,
  RegisterIntegrationProvider,
  useStoredRegisterIntegration,
};
