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

import { graphics } from 'assets';
import { t } from 'i18next';

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
          <StyledRawExplorerNotSelectedArrow
            src={graphics.EmptyStateArrowGraphic}
          />
          <StyledRawExplorerNotSelectedTitle level={3}>
            {t('select_a_table_to_view')}
          </StyledRawExplorerNotSelectedTitle>
          {isError && (
            <StyledRawExplorerNotSelectedBody>
              {t('table_not_found')}
            </StyledRawExplorerNotSelectedBody>
          )}
          <StyledRawExplorerNotSelectedBody>
            {t('use_the_side_menu')}
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
  background-color: ${Colors['bg-accent'].hex()};
  height: 100%;
  padding: 300px 210px;
  position: relative;
`;

const StyledRawExplorerNotSelectedContent = styled.div`
  margin-bottom: 30px;
  width: 400px;
`;

const StyledRawExplorerNotSelectedTitle = styled(Title)`
  color: ${Colors['text-secondary'].hex()};
`;

const StyledRawExplorerNotSelectedBody = styled(Body)`
  color: ${Colors['text-hint'].hex()};
  margin-top: 12px;
`;

const StyledRawExplorerNotSelectedArrow = styled.img`
  position: absolute;
  left: 32px;
  top: 190px;
  width: 160px;
`;
