/*!
 * Copyright 2023 Cognite AS
 */

import {
  type ReactElement,
  createContext,
  useContext,
  useState,
  type ReactNode,
  useMemo
} from 'react';

type Reveal3DResourcesCountContent = {
  reveal3DResourcesCount: number;
  setRevealResourcesCount: (newCount: number) => void;
};

const Reveal3DResourcesCountContext = createContext<Reveal3DResourcesCountContent | null>(null);

export const useReveal3DResourcesCount = (): Reveal3DResourcesCountContent => {
  const element = useContext(Reveal3DResourcesCountContext);
  if (element === null) {
    throw new Error(
      'useReveal3DResourcesCount must be used within a Reveal3DResourcesCountContextProvider'
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
  const memoedState = useMemo(
    () => ({
      reveal3DResourcesCount,
      setRevealResourcesCount
    }),
    [reveal3DResourcesCount, setRevealResourcesCount]
  );
  return (
    <Reveal3DResourcesCountContext.Provider value={memoedState}>
      {children}
    </Reveal3DResourcesCountContext.Provider>
  );
};
