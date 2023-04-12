import React, { Dispatch, SetStateAction, useContext, useState } from 'react';

type WorkflowBuilderContextT = {
  isComponentsPanelVisible: boolean;
  setIsComponentsPanelVisible: Dispatch<SetStateAction<boolean>>;
};

const WorkflowBuilderContext = React.createContext<WorkflowBuilderContextT>(
  {} as any
);

type WorkflowBuilderContextProviderProps = {
  children: React.ReactNode;
};

export const WorkflowBuilderContextProvider = ({
  children,
}: WorkflowBuilderContextProviderProps): JSX.Element => {
  const [isComponentsPanelVisible, setIsComponentsPanelVisible] =
    useState(false);

  return (
    <WorkflowBuilderContext.Provider
      value={{
        isComponentsPanelVisible,
        setIsComponentsPanelVisible,
      }}
    >
      {children}
    </WorkflowBuilderContext.Provider>
  );
};

export const useWorkflowBuilderContext = () =>
  useContext(WorkflowBuilderContext);
