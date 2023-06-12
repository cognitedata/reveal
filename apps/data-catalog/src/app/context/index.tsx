import { createContext, ReactNode, useState, useContext } from 'react';
import { DataSetsState } from './types';
import { CreationDataSet } from '../utils/types';

export const DataSetsContextDefault: DataSetsState = {
  setCreationDataSet: () => null,
  setSelectedDataSet: () => null,
  setMode: () => null,
  mode: 'create',
};

export const DataSetsContext = createContext<DataSetsState>(
  DataSetsContextDefault
);

export const DataSetsContextProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [selectedDataSet, setSelectedDataSet] = useState<number>();
  const [creationDataSet, setCreationDataSet] = useState<CreationDataSet>();
  const [mode, setMode] = useState<'create' | 'edit'>('create');

  return (
    <DataSetsContext.Provider
      value={{
        selectedDataSet,
        creationDataSet,
        setSelectedDataSet,
        setCreationDataSet,
        mode,
        setMode,
      }}
    >
      {children}
    </DataSetsContext.Provider>
  );
};

// Utility hooks for dealing with the context
export const useSelectedDataSet = () => {
  const { selectedDataSet, setSelectedDataSet } = useContext(DataSetsContext);
  return { selectedDataSet, setSelectedDataSet };
};

export const useDataSetMode = () => {
  const { mode, setMode } = useContext(DataSetsContext);
  return { mode, setMode };
};

export const useCreationDataSet = () => {
  const { creationDataSet, setCreationDataSet } = useContext(DataSetsContext);
  return { creationDataSet, setCreationDataSet };
};
