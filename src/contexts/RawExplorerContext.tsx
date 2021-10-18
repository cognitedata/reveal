import React, { createContext, useState } from 'react';

export enum RawExplorerModal {
  CreateDatabase,
}

type RawExplorerState = {
  closeModal: (type: RawExplorerModal) => void;
  isModalOpen: (type: RawExplorerModal) => boolean;
  openModal: (type: RawExplorerModal) => void;
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
      }}
    >
      {children}
    </RawExplorerContext.Provider>
  );
};
