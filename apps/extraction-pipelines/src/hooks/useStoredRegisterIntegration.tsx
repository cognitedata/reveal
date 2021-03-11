import React, { PropsWithChildren, useContext, useState } from 'react';
import { RegisterIntegrationInfo } from 'model/Integration';

interface ContextProps {
  storedIntegration: Partial<RegisterIntegrationInfo>;
  setStoredIntegration: React.Dispatch<
    React.SetStateAction<Partial<RegisterIntegrationInfo>>
  >;
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
  const [storedIntegration, setStoredIntegration] = useState<
    Partial<RegisterIntegrationInfo>
  >(initIntegration ?? {});
  return (
    <RegisterIntegrationContext.Provider
      value={{ storedIntegration, setStoredIntegration }}
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
