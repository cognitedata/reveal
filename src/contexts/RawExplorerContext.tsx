import React, {
  createContext,
  Dispatch,
  SetStateAction,
  useState,
} from 'react';

export enum RawExplorerModal {
  CreateDatabase,
}

export type SidePanelOptions = {
  selectedDatabase?: string;
  selectedTable?: string;
};
export type SelectedCell = {
  rowIndex: number | undefined;
  columnIndex: number | undefined;
};

type RawExplorerState = {
  isSidePanelOpen: boolean;
  setIsSidePanelOpen: Dispatch<SetStateAction<boolean>>;
  selectedSidePanelDatabase?: string;
  setSelectedSidePanelDatabase: Dispatch<SetStateAction<string | undefined>>;
  selectedCell: SelectedCell;
  setSelectedCell: Dispatch<SetStateAction<SelectedCell>>;
  isCellExpanded: boolean;
  setIsCellExpanded: Dispatch<SetStateAction<boolean>>;
};

export const RawExplorerContext = createContext<RawExplorerState>(
  {} as RawExplorerState
);

type RawExplorerProviderProps = {
  children: React.ReactNode;
};

export const RawExplorerProvider = ({ children }: RawExplorerProviderProps) => {
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(true);
  const [selectedSidePanelDatabase, setSelectedSidePanelDatabase] = useState<
    string | undefined
  >();
  const [selectedCell, setSelectedCell] = useState<SelectedCell>({
    rowIndex: undefined,
    columnIndex: undefined,
  });
  const [isCellExpanded, setIsCellExpanded] = useState<boolean>(false);

  return (
    <RawExplorerContext.Provider
      value={{
        isSidePanelOpen,
        setIsSidePanelOpen,
        selectedSidePanelDatabase,
        setSelectedSidePanelDatabase,
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
