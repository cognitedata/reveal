import React, {
  createContext,
  Dispatch,
  SetStateAction,
  useState,
} from 'react';

import { NO_CELL_SELECTED } from 'utils/table';

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
  cellData: string | undefined;
};

type RawExplorerState = {
  isSidePanelOpen: boolean;
  setIsSidePanelOpen: Dispatch<SetStateAction<boolean>>;
  selectedSidePanelDatabase?: string;
  setSelectedSidePanelDatabase: Dispatch<SetStateAction<string | undefined>>;

  isProfilingSidebarOpen: boolean;
  setIsProfilingSidebarOpen: Dispatch<SetStateAction<boolean>>;
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
  children: React.ReactNode;
};

export const RawExplorerProvider = ({ children }: RawExplorerProviderProps) => {
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(true);
  const [selectedSidePanelDatabase, setSelectedSidePanelDatabase] = useState<
    string | undefined
  >();

  const [isProfilingSidebarOpen, setIsProfilingSidebarOpen] = useState(false);
  const [selectedColumnKey, setSelectedColumnKey] = useState<
    string | undefined
  >();

  const [selectedCell, setSelectedCell] =
    useState<SelectedCell>(NO_CELL_SELECTED);
  const [isCellExpanded, setIsCellExpanded] = useState<boolean>(false);

  return (
    <RawExplorerContext.Provider
      value={{
        isSidePanelOpen,
        setIsSidePanelOpen,
        selectedSidePanelDatabase,
        setSelectedSidePanelDatabase,

        isProfilingSidebarOpen,
        setIsProfilingSidebarOpen,
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
