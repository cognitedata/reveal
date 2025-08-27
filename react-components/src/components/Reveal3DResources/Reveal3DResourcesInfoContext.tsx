import {
  type ReactElement,
  createContext,
  useContext,
  useState,
  type ReactNode,
  useMemo,
  type Dispatch,
  type SetStateAction
} from 'react';

type Reveal3DResourcesInfoContent = {
  reveal3DResourcesCount: number;
  setRevealResourcesCount: (newCount: number) => void;
  reveal3DResourceLoadFailCount: number;
  setReveal3DResourceLoadFailCount: Dispatch<SetStateAction<number>>;
  reveal3DResourcesExpectedToLoad: number;
  setReveal3DResourcesExpectedToLoad: Dispatch<SetStateAction<number>>;
  model3DStylingLoading: boolean;
  setModel3DStylingLoading: (loading: boolean) => void;
};

const Reveal3DResourcesInfoContext = createContext<Reveal3DResourcesInfoContent | null>(null);

const useInfoElementOfContext = (): Reveal3DResourcesInfoContent => {
  const element = useContext(Reveal3DResourcesInfoContext);
  if (element === null) {
    throw new Error(
      'ResourcesInfoContent must be used within a Reveal3DResourcesInfoContextProvider'
    );
  }
  return element;
};

export const useReveal3DResourcesCount = (): Pick<
  Reveal3DResourcesInfoContent,
  'reveal3DResourcesCount' | 'setRevealResourcesCount'
> => {
  const element = useInfoElementOfContext();
  return {
    reveal3DResourcesCount: element.reveal3DResourcesCount,
    setRevealResourcesCount: element.setRevealResourcesCount
  };
};

export const useReveal3DResourceLoadFailCount = (): Pick<
  Reveal3DResourcesInfoContent,
  'reveal3DResourceLoadFailCount' | 'setReveal3DResourceLoadFailCount'
> => {
  return useInfoElementOfContext();
};

export const useReveal3DResourcesExpectedInViewerCount = (): number => {
  const element = useInfoElementOfContext();
  return element.reveal3DResourcesExpectedToLoad - element.reveal3DResourceLoadFailCount;
};

export const useReveal3DResourcesSetExpectedToLoadCount = (): Dispatch<SetStateAction<number>> => {
  const element = useInfoElementOfContext();
  return element.setReveal3DResourcesExpectedToLoad;
};

export const useReveal3DLoadedResourceCount = (): number => {
  return useInfoElementOfContext().reveal3DResourcesCount;
};

export const useReveal3DResourcesStylingLoading = (): boolean => {
  const element = useInfoElementOfContext();
  return element.model3DStylingLoading;
};

export const useReveal3DResourcesStylingLoadingSetter = (): ((value: boolean) => void) => {
  const element = useInfoElementOfContext();
  return element.setModel3DStylingLoading;
};

export const Reveal3DResourcesInfoContextProvider = ({
  children
}: {
  children: ReactNode;
}): ReactElement => {
  const [reveal3DResourcesCount, setRevealResourcesCount] = useState<number>(0);
  const [model3DStylingLoading, setModel3DStylingLoading] = useState<boolean>(false);
  const [reveal3DResourcesExpectedToLoad, setReveal3DResourcesExpectedToLoad] = useState<number>(0);
  const [reveal3DResourceLoadFailCount, setReveal3DResourceLoadFailCount] = useState<number>(0);
  const memoedState: Reveal3DResourcesInfoContent = useMemo(
    () => ({
      reveal3DResourcesCount,
      setRevealResourcesCount,
      reveal3DResourceLoadFailCount,
      setReveal3DResourceLoadFailCount,
      reveal3DResourcesExpectedToLoad,
      setReveal3DResourcesExpectedToLoad,
      model3DStylingLoading,
      setModel3DStylingLoading
    }),
    [
      reveal3DResourcesCount,
      setRevealResourcesCount,
      reveal3DResourceLoadFailCount,
      setReveal3DResourceLoadFailCount,
      reveal3DResourcesExpectedToLoad,
      setReveal3DResourcesExpectedToLoad,
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
