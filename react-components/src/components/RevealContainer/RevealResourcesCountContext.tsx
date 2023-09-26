/*!
 * Copyright 2023 Cognite AS
 */

import { type ReactElement, createContext, useContext, useState, type ReactNode } from 'react';

type RevealResourcesCountContent = {
  reveal3DResourcesCount: number;
  setRevealResourcesCount: (newCount: number) => void;
};

export const RevealResourcesCountContext = createContext<RevealResourcesCountContent | null>(null);

export const useRevealResourcesCount = (): RevealResourcesCountContent => {
  const element = useContext(RevealResourcesCountContext);
  if (element === null) {
    throw new Error('useRevealResources must be used within a RevealResourcesContextProvider');
  }
  return element;
};

export const RevealResourcesCountContextProvider = ({
  children
}: {
  children: ReactNode;
}): ReactElement => {
  const [reveal3DResourcesCount, setRevealResourcesCount] = useState<number>(0);
  return (
    <RevealResourcesCountContext.Provider
      value={{ reveal3DResourcesCount, setRevealResourcesCount }}>
      {children}
    </RevealResourcesCountContext.Provider>
  );
};
