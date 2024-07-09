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

type Reveal3DResourcesInfoContent = {
  reveal3DResourcesCount: number;
  setRevealResourcesCount: (newCount: number) => void;
  model3DStylingLoading: boolean;
  setModel3DStylingLoading: (loading: boolean) => void;
};

const Reveal3DResourcesInfoContext = createContext<Reveal3DResourcesInfoContent | null>(null);

const getInfoElementOfContext = (): Reveal3DResourcesInfoContent => {
  const element = useContext(Reveal3DResourcesInfoContext);
  if (element === null) {
    throw new Error(
      'ResourcesInfoContent must be used within a Reveal3DResourcesInfoContextProvider'
    );
  }
  return element;
};

export const useReveal3DResourcesCount = (): Reveal3DResourcesInfoContent => {
  const element = getInfoElementOfContext();
  return element;
};

export const useReveal3DResourcesStylingLoading = (): boolean => {
  const element = getInfoElementOfContext();
  return element.model3DStylingLoading;
};

export const useReveal3DResourcesStylingLoadingSetter = (): ((value: boolean) => void) => {
  const element = getInfoElementOfContext();
  return element.setModel3DStylingLoading;
};

export const Reveal3DResourcesInfoContextProvider = ({
  children
}: {
  children: ReactNode;
}): ReactElement => {
  const [reveal3DResourcesCount, setRevealResourcesCount] = useState<number>(0);
  const [model3DStylingLoading, setModel3DStylingLoading] = useState<boolean>(false);
  const memoedState = useMemo(
    () => ({
      reveal3DResourcesCount,
      setRevealResourcesCount,
      model3DStylingLoading,
      setModel3DStylingLoading
    }),
    [
      reveal3DResourcesCount,
      setRevealResourcesCount,
      model3DStylingLoading,
      setModel3DStylingLoading
    ]
  );
  return (
    <Reveal3DResourcesInfoContext.Provider value={memoedState}>
      {children}
    </Reveal3DResourcesInfoContext.Provider>
  );
};
