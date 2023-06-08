import React, {
  createContext,
  Dispatch,
  SetStateAction,
  useContext,
  useState,
} from 'react';

import styled from 'styled-components';

import graphics from '@raw-explorer/common/assets/graphics';
import { useTranslation } from '@raw-explorer/common/i18n';
import { useTableRows } from '@raw-explorer/hooks/sdk-queries';
import { DEFAULT_FILTER } from '@raw-explorer/hooks/table-filters';
import { SpecificTable, useActiveTable } from '@raw-explorer/hooks/table-tabs';

import { Colors, Title, Body, Loader } from '@cognite/cogs.js';

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
  const { t } = useTranslation();
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
            {t('spreadsheet-select-table')}
          </StyledRawExplorerNotSelectedTitle>
          {isError && (
            <StyledRawExplorerNotSelectedBody>
              {t('spreadsheet-table-not-found')}
            </StyledRawExplorerNotSelectedBody>
          )}
          <StyledRawExplorerNotSelectedBody>
            {t('spreadsheet-use-side-menu')}
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
  background-color: ${Colors['surface--medium']};
  height: 100%;
  padding: 300px 210px;
  position: relative;
`;

const StyledRawExplorerNotSelectedContent = styled.div`
  margin-bottom: 30px;
  width: 400px;
`;

const StyledRawExplorerNotSelectedTitle = styled(Title)`
  color: ${Colors['text-icon--medium']};
`;

const StyledRawExplorerNotSelectedBody = styled(Body)`
  color: ${Colors['text-icon--muted']};
  margin-top: 12px;
`;

const StyledRawExplorerNotSelectedArrow = styled.img`
  position: absolute;
  left: 32px;
  top: 190px;
  width: 160px;
`;
