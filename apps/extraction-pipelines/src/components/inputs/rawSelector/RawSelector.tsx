import React, { useState } from 'react';
import { RawDB, RawDBTable } from 'cognite-sdk-v3';
import { Graphic, Input, Table } from '@cognite/cogs.js';
import styled from 'styled-components';
import { DivFlex } from 'styles/flex/StyledFlex';
import { getDatabaseTables } from 'utils/raw/rawUtils';
import { SelectionColumns } from 'components/inputs/rawSelector/SelectedDBTablesColumns';
import { DatabaseTables } from 'components/inputs/rawSelector/DatabaseTables';
import { DatabaseSelector } from 'components/inputs/rawSelector/DatabaseSelector';
import { IntegrationRawTable } from 'model/Integration';
import { StyledLabel } from 'styles/StyledForm';

const Selector = styled.div`
  width: 100%;
  display: flex;
  margin-bottom: 1rem;
`;
const SearchWrapper = styled.div`
  flex: 1;
`;
const StyledInput = styled(Input)`
  .addons-input-wrapper {
    .input-wrapper {
      flex: 1;
      input[type='search'] {
        width: 100%;
        margin-bottom: 0;
      }
    }
  }
`;

export const TABLES_LABEL: Readonly<string> = 'Tables';
export const DBS_LABEL: Readonly<string> = 'Databases';
const DEFAULT_SELECTED_PAGE_SIZE: Readonly<number> = 4;

export type DatabaseWithTablesItem = {
  database: RawDB;
  tables: RawDBTable[];
};

interface RawSelectorProps {
  databaseList: DatabaseWithTablesItem[];
  setSelectedDb(value: string): void;
  selectedTables: IntegrationRawTable[];
  setSelectedTables(value: IntegrationRawTable[]): void;
  setChangesSaved(value: boolean): void;
  selectedDb: string;
}

const RawSelector = ({
  databaseList,
  selectedDb,
  setSelectedDb,
  selectedTables,
  setChangesSaved,
  setSelectedTables,
}: RawSelectorProps): JSX.Element => {
  const [dbSearch, setDbSearch] = useState<string>('');
  const [tableSearch, setTableSearch] = useState<string>('');

  const onChangeTablesList = (key: string) => {
    const keyItem = {
      dbName: key.split('/')[0],
      tableName: key.split('/')[1],
    };
    setChangesSaved(false);
    if (
      selectedTables.some(
        (record) =>
          record.dbName === keyItem.dbName &&
          record.tableName === keyItem.tableName
      )
    ) {
      setSelectedTables(
        selectedTables.filter((item) => {
          return (
            item.dbName !== keyItem.dbName ||
            item.tableName !== keyItem.tableName
          );
        })
      );
    } else {
      setSelectedTables([keyItem, ...selectedTables]);
    }
  };

  const anyDbTableSelected = (dbName: string): boolean => {
    return !!selectedTables.find((rawItem) => rawItem.dbName === dbName);
  };

  const allDbTableSelected = (item: DatabaseWithTablesItem): boolean => {
    return item.tables.every(
      (table) =>
        !!selectedTables.find(
          (selectedTable) => selectedTable.tableName === table.name
        )
    );
  };

  const handleDatabaseChecked = (item: DatabaseWithTablesItem) => {
    if (allDbTableSelected(item)) {
      // unselect all
      setSelectedTables(
        selectedTables.filter(
          (selectedItem) => item.database.name !== selectedItem.dbName
        )
      );
    } else {
      const selected: IntegrationRawTable[] = [
        ...item.tables.map((table) => ({
          dbName: item.database.name,
          tableName: table.name,
        })),
        ...selectedTables.filter(
          (rawItem) => rawItem.dbName !== item.database.name
        ),
      ];
      setSelectedDb(item.database.name);
      setSelectedTables(selected);
    }
  };

  function localeEmpty() {
    return {
      emptyText: (
        <DivFlex direction="column" align="center">
          <Graphic type="Search" />
          Select raw tables
        </DivFlex>
      ),
    };
  }

  return (
    <>
      <Selector>
        <SearchWrapper>
          <StyledLabel htmlFor="search-database-input">{DBS_LABEL}</StyledLabel>
          <StyledInput
            id="search-database-input"
            type="search"
            placeholder="Filter databases"
            onChange={(val) => setDbSearch(val.currentTarget.value)}
            aria-label="Filter databases"
            icon="Search"
            iconPlacement="right"
          />
          <DatabaseSelector
            databaseList={databaseList}
            search={dbSearch}
            selectedDb={selectedDb}
            setSelectedDb={setSelectedDb}
            handleDatabaseChecked={handleDatabaseChecked}
            anyDbTableSelected={anyDbTableSelected}
          />
        </SearchWrapper>
        <SearchWrapper>
          <StyledLabel htmlFor="search-database-table-input">
            {TABLES_LABEL}
          </StyledLabel>
          <StyledInput
            id="search-database-table-input"
            type="search"
            placeholder="Filter tables"
            onChange={(val) => setTableSearch(val.currentTarget.value)}
            aria-label="Filter tables"
            icon="Search"
            iconPlacement="right"
          />
          <DatabaseTables
            selectedDb={selectedDb}
            databaseTables={getDatabaseTables({
              databaseList,
              selectedDb,
              tableSearch,
            })}
            selectedTables={selectedTables}
            onChangeTablesList={onChangeTablesList}
          />
        </SearchWrapper>
      </Selector>
      <Table<IntegrationRawTable>
        pagination
        locale={localeEmpty()}
        columns={SelectionColumns}
        dataSource={selectedTables}
        pageSize={DEFAULT_SELECTED_PAGE_SIZE}
      />
    </>
  );
};

export default RawSelector;
