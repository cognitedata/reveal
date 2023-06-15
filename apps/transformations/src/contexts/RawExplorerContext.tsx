import {
  ReactNode,
  createContext,
  useContext,
  useState,
  SetStateAction,
  Dispatch,
} from 'react';

import { NO_CELL_SELECTED } from '@transformations/utils/table';

export type SelectedCell = {
  rowIndex: number | undefined;
  columnIndex: number | undefined;
  cellData: string | undefined;
};

type RawExplorerState = {
  selectedColumnKey?: string;
  setSelectedColumnKey: Dispatch<SetStateAction<string | undefined>>;
  selectedCell: SelectedCell;
  setSelectedCell: Dispatch<SetStateAction<SelectedCell>>;
  isCellExpanded: boolean;
  setIsCellExpanded: Dispatch<SetStateAction<boolean>>;
};

export const RawExplorerContext = createContext<RawExplorerState>(
  {} as RawExplorerState
);

type RawExplorerProviderProps = {
  children: ReactNode;
};

export const useRawExplorerContext = () => useContext(RawExplorerContext);

export const RawExplorerContextProvider = ({
  children,
}: RawExplorerProviderProps) => {
  const [selectedColumnKey, setSelectedColumnKey] = useState<
    string | undefined
  >();

  const [selectedCell, setSelectedCell] =
    useState<SelectedCell>(NO_CELL_SELECTED);
  const [isCellExpanded, setIsCellExpanded] = useState<boolean>(false);

  return (
    <RawExplorerContext.Provider
      value={{
        selectedColumnKey,
        setSelectedColumnKey,
        selectedCell,
        setSelectedCell,
        isCellExpanded,
        setIsCellExpanded,
      }}
    >
      {children}
    </RawExplorerContext.Provider>
  );
};
