/*!
 * Copyright 2023 Cognite AS
 */

import { type ReactElement, createContext, useContext, useState, type ReactNode } from 'react';

type Reveal3DResourcesCountContext = {
  reveal3DResourcesCount: number;
  setRevealResourcesCount: (newCount: number) => void;
};

const Reveal3DResourcesCountContext = createContext<Reveal3DResourcesCountContext | null>(null);

export const useReveal3DResourcesCount = (): Reveal3DResourcesCountContext => {
  const element = useContext(Reveal3DResourcesCountContext);
  if (element === null) {
    throw new Error(
      'useRevealResources must be used within a Reveal3DResourcesCountContextProvider'
    );
  }
  return element;
};

export const Reveal3DResourcesCountContextProvider = ({
  children
}: {
  children: ReactNode;
}): ReactElement => {
  const [reveal3DResourcesCount, setRevealResourcesCount] = useState<number>(0);
  return (
    <Reveal3DResourcesCountContext.Provider
      value={{ reveal3DResourcesCount, setRevealResourcesCount }}>
      {children}
    </Reveal3DResourcesCountContext.Provider>
  );
};
