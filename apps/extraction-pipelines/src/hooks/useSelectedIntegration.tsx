import { Integration } from 'model/Integration';
import React, { PropsWithChildren, useContext, useState } from 'react';

interface ContextProps {
  integration: Integration | null;
  setIntegration: (integration: Integration) => void;
}

const SelectedIntegrationContext = React.createContext<
  ContextProps | undefined
>(undefined);

interface Props {
  initIntegration?: Integration;
}

const SelectedIntegrationProvider = ({
  initIntegration,
  children,
}: PropsWithChildren<Props>) => {
  const [integration, setIntegration] = useState<Integration | null>(
    initIntegration ?? null
  );
  return (
    <SelectedIntegrationContext.Provider
      value={{ integration, setIntegration }}
    >
      {children}
    </SelectedIntegrationContext.Provider>
  );
};

const useSelectedIntegration = () => {
  const context = useContext(SelectedIntegrationContext);
  if (context === undefined) {
    throw new Error(
      'You can not use selected integration context with out SelectedIntegrationProvider'
    );
  }
  return context;
};

export {
  SelectedIntegrationContext,
  SelectedIntegrationProvider,
  useSelectedIntegration,
};
