import React, {
  createContext,
  Dispatch,
  SetStateAction,
  useState,
} from 'react';
import { RawDBRow } from '@cognite/sdk';

export enum RawExplorerModal {
  CreateDatabase,
}

type RawExplorerState = {
  closeModal: (type: RawExplorerModal) => void;
  isModalOpen: (type: RawExplorerModal) => boolean;
  openModal: (type: RawExplorerModal) => void;
  isFetchingTableData: boolean;
  setIsFetchingTableData: Dispatch<SetStateAction<boolean>>;
  tableData: RawDBRow[];
  setTableData: Dispatch<SetStateAction<RawDBRow[]>>;
  fetchLimit: number;
  setFetchLimit: Dispatch<SetStateAction<number>>;
};

export const RawExplorerContext = createContext<RawExplorerState>(
  {} as RawExplorerState
);

type RawExplorerProviderProps = {
  children: React.ReactNode;
};

export const RawExplorerProvider = ({ children }: RawExplorerProviderProps) => {
  const [modalVisibilityStates, setModalVisibilityStates] = useState<
    Record<RawExplorerModal, boolean>
  >({} as Record<RawExplorerModal, boolean>);
  const [isFetchingTableData, setIsFetchingTableData] =
    useState<boolean>(false);
  const [tableData, setTableData] = useState<RawDBRow[]>([]);
  const [fetchLimit, setFetchLimit] = useState<number>(100);

  const closeModal = (type: RawExplorerModal): void => {
    setModalVisibilityStates((prevModalVisibilityStates) => ({
      ...prevModalVisibilityStates,
      [type]: false,
    }));
  };

  const isModalOpen = (type: RawExplorerModal): boolean => {
    return Boolean(modalVisibilityStates[type]);
  };

  const openModal = (type: RawExplorerModal): void => {
    setModalVisibilityStates((prevModalVisibilityStates) => ({
      ...prevModalVisibilityStates,
      [type]: true,
    }));
  };

  return (
    <RawExplorerContext.Provider
      value={{
        closeModal,
        isModalOpen,
        openModal,
        isFetchingTableData,
        setIsFetchingTableData,
        tableData,
        setTableData,
        fetchLimit,
        setFetchLimit,
      }}
    >
      {children}
    </RawExplorerContext.Provider>
  );
};
