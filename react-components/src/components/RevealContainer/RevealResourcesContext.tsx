/*!
 * Copyright 2023 Cognite AS
 */

import { CogniteModel } from '@cognite/reveal';
import { createContext, useContext, useState } from 'react';

type RevealResourcesContext = {
  reveal3DResources: CogniteModel[];
  update3DResources: (newResources: CogniteModel[]) => void;
};

export const RevealResourcesContext = createContext<RevealResourcesContext | null>(null);

export const useRevealResources = (): RevealResourcesContext => {
  const element = useContext(RevealResourcesContext);
  if (element === null) {
    throw new Error(
      'useRevealResources must be used within a RevealResourcesContextProvider'
    );
  }
  return element;
};

export const RevealResourcesContextProvider = ({
  children
}: {
  children: React.ReactNode;
}): JSX.Element => {
  const [reveal3DResources, setRevealResources] = useState<
    CogniteModel[]
  >([]);

  const update3DResources = (newResources: CogniteModel[]) => {
    setRevealResources(newResources);
  };
  return (
    <RevealResourcesContext.Provider value={{ reveal3DResources, update3DResources }}>
      {children}
    </RevealResourcesContext.Provider>
  );
}

