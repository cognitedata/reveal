/*!
 * Copyright 2023 Cognite AS
 */

import { type CogniteModel } from '@cognite/reveal';
import { type ReactElement, createContext, useContext, useState, type ReactNode } from 'react';

type RevealResourcesContextType = {
  reveal3DResources: CogniteModel[];
  update3DResources: (newResources: CogniteModel[]) => void;
};

export const RevealResourcesContext = createContext<RevealResourcesContextType | null>(null);

export const useRevealResources = (): RevealResourcesContextType => {
  const element = useContext(RevealResourcesContext);
  if (element === null) {
    throw new Error('useRevealResources must be used within a RevealResourcesContextProvider');
  }
  return element;
};

export const RevealResourcesContextProvider = ({
  children
}: {
  children: ReactNode;
}): ReactElement => {
  const [reveal3DResources, setRevealResources] = useState<CogniteModel[]>([]);

  const update3DResources = (newResources: CogniteModel[]): void => {
    setRevealResources(newResources);
  };
  return (
    <RevealResourcesContext.Provider value={{ reveal3DResources, update3DResources }}>
      {children}
    </RevealResourcesContext.Provider>
  );
};
