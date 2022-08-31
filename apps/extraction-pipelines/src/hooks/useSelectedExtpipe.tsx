import { Extpipe } from 'model/Extpipe';
import React, {
  Dispatch,
  PropsWithChildren,
  useContext,
  useState,
} from 'react';

interface ContextProps {
  extpipe: Extpipe | null;
  setExtpipe: Dispatch<React.SetStateAction<Extpipe | null>>;
}

const SelectedExtpipeContext = React.createContext<ContextProps | undefined>(
  undefined
);

interface Props {
  initExtpipe?: Extpipe;
}

const SelectedExtpipeProvider = ({
  initExtpipe,
  children,
}: PropsWithChildren<Props>) => {
  const [extpipe, setExtpipe] = useState<Extpipe | null>(initExtpipe ?? null);
  return (
    <SelectedExtpipeContext.Provider value={{ extpipe, setExtpipe }}>
      {children}
    </SelectedExtpipeContext.Provider>
  );
};

const useSelectedExtpipe = () => {
  const context = useContext(SelectedExtpipeContext);
  if (context === undefined) {
    throw new Error(
      `You can not use selected extraction pipelines context with out SelectedExtpipeProvider`
    );
  }
  return context;
};

export { SelectedExtpipeContext, SelectedExtpipeProvider, useSelectedExtpipe };
