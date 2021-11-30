import React, {
  createContext,
  Dispatch,
  SetStateAction,
  useContext,
  useState,
} from 'react';
import styled from 'styled-components';
import { Colors, Title, Body, Loader } from '@cognite/cogs.js';

import { useTableRows } from 'hooks/sdk-queries';
import { SpecificTable, useActiveTable } from 'hooks/table-tabs';
import { DEFAULT_FILTER } from 'hooks/table-filters';

import icons from 'assets/icons';
import {
  SIDE_PANEL_TRANSITION_DURATION,
  SIDE_PANEL_TRANSITION_FUNCTION,
} from 'utils/constants';

type ActiveTableState = {
  database: string;
  table: string;
  view?: string;
  update: (_: SpecificTable) => void;

  columnTypeFilters: string[];
  setColumnTypeFilters: Dispatch<SetStateAction<string[]>>;
  columnNameFilter: string;
  setColumnNameFilter: Dispatch<SetStateAction<string>>;
};

export const ActiveTableContext = createContext<ActiveTableState>(
  {} as ActiveTableState
);

type ActiveTableProviderProps = {
  children: React.ReactNode;
};

export const useActiveTableContext = () => useContext(ActiveTableContext);

export const ActiveTableProvider = ({ children }: ActiveTableProviderProps) => {
  const [[database, table, view] = [], update] = useActiveTable();
  const { isFetched, isError } = useTableRows(
    { database: database!, table: table!, pageSize: 1 },
    { enabled: !!database && !!table }
  );

  const [columnNameFilter, setColumnNameFilter] = useState('');
  const [columnTypeFilters, setColumnTypeFilters] = useState<string[]>([
    DEFAULT_FILTER.type,
  ]);

  if (!database || !table || isError) {
    return (
      <StyledRawExplorerNotSelectedWrapper>
        <StyledRawExplorerNotSelectedContent>
          <StyledRawExplorerNotSelectedArrow src={icons.EmptyStateArrowIcon} />
          <Title level={3}>Select a table to view raw data</Title>
          {isError && (
            <StyledRawExplorerNotSelectedBody>
              The specified table was not found!
            </StyledRawExplorerNotSelectedBody>
          )}
          <StyledRawExplorerNotSelectedBody>
            Use the side menu to navigate between databases and open raw tables.
          </StyledRawExplorerNotSelectedBody>
        </StyledRawExplorerNotSelectedContent>
      </StyledRawExplorerNotSelectedWrapper>
    );
  }

  if (!isFetched) {
    return <Loader />;
  }

  return (
    <ActiveTableContext.Provider
      value={{
        database,
        table,
        update,
        view,
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

const StyledRawExplorerNotSelectedWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 0 128px;
  position: relative;
`;

const StyledRawExplorerNotSelectedContent = styled.div`
  margin-bottom: 30px;
  width: 400px;
`;

const StyledRawExplorerNotSelectedBody = styled(Body)`
  color: ${Colors['text-hint'].hex()};
  margin-top: 12px;
`;

const StyledRawExplorerNotSelectedArrow = styled.img`
  position: absolute;
  left: 125px;
  opacity: 1;
  transform: translateY(calc(-100% - 75px));
  transition: opacity ${SIDE_PANEL_TRANSITION_DURATION}s
    ${SIDE_PANEL_TRANSITION_FUNCTION};
  top: calc(50%);
  max-height: 180px;
  width: calc(50% - 400px);

  @media screen and (max-width: 1400px) {
    opacity: 0;
  }
`;
