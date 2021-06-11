import { Integration } from 'model/Integration';
import React, {
  Dispatch,
  PropsWithChildren,
  useContext,
  useState,
} from 'react';
import { EXTRACTION_PIPELINE_LOWER } from 'utils/constants';

interface ContextProps {
  integration: Integration | null;
  setIntegration: Dispatch<React.SetStateAction<Integration | null>>;
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
      `You can not use selected ${EXTRACTION_PIPELINE_LOWER} context with out SelectedIntegrationProvider`
    );
  }
  return context;
};

export {
  SelectedIntegrationContext,
  SelectedIntegrationProvider,
  useSelectedIntegration,
};
