import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  SetStateAction,
  Dispatch,
} from 'react';

import { useActiveTable } from 'hooks/table-tabs';
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

  profilingSidebarOpenState: boolean;
  setProfilingSidebarOpenState: Dispatch<SetStateAction<boolean>>;
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

export const useRawExplorerContext = () => useContext(RawExplorerContext);

export const RawExplorerProvider = ({ children }: RawExplorerProviderProps) => {
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(true);
  const [selectedSidePanelDatabase, setSelectedSidePanelDatabase] = useState<
    string | undefined
  >();

  const [profilingSidebarOpenState, setProfilingSidebarOpenState] =
    useState(false);
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

        profilingSidebarOpenState,
        setProfilingSidebarOpenState,
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

export const useProfilingSidebar = () => {
  const {
    profilingSidebarOpenState,
    setProfilingSidebarOpenState,
    setSelectedColumnKey,
  } = useRawExplorerContext();
  const [[activeTable] = []] = useActiveTable();

  const setIsProfilingSidebarOpen = (isOpen: boolean) => {
    if (!isOpen) setSelectedColumnKey(undefined);
    setProfilingSidebarOpenState(isOpen);
  };

  useEffect(() => {
    setIsProfilingSidebarOpen(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTable]);

  return {
    isProfilingSidebarOpen: profilingSidebarOpenState,
    setIsProfilingSidebarOpen,
  };
};
