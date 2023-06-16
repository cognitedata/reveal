import {
  ReactNode,
  createContext,
  Dispatch,
  SetStateAction,
  useContext,
  useState,
} from 'react';

import { DEFAULT_FILTER } from '@transformations/hooks/table-filters';

type ActiveTableState = {
  columnTypeFilters: string[];
  setColumnTypeFilters: Dispatch<SetStateAction<string[]>>;

  columnNameFilter: string;
  setColumnNameFilter: Dispatch<SetStateAction<string>>;
};

export const ActiveTableContext = createContext<ActiveTableState>(
  {} as ActiveTableState
);

type ActiveTableProviderProps = {
  children: ReactNode;
};

export const useActiveTableContext = () => useContext(ActiveTableContext);

export const ActiveTableProvider = ({
  children,
}: ActiveTableProviderProps): JSX.Element => {
  const [columnNameFilter, setColumnNameFilter] = useState('');
  const [columnTypeFilters, setColumnTypeFilters] = useState<string[]>([
    DEFAULT_FILTER.type,
  ]);

  return (
    <ActiveTableContext.Provider
      value={{
        columnTypeFilters,
        setColumnTypeFilters,

        columnNameFilter,
        setColumnNameFilter,
      }}
    >
      {children}
    </ActiveTableContext.Provider>
  );
};
