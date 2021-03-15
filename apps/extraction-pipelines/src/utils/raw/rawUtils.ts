import { RawDBTable } from '@cognite/sdk';
import { IntegrationRawTable } from 'model/Integration';
import { RawTableFormInput, RawTableOptions } from 'pages/create/RawTablePage';
import { DatabaseWithTablesItem } from 'components/inputs/rawSelector/RawSelector';

interface Args {
  databaseList: DatabaseWithTablesItem[];
  selectedDb: string;
  tableSearch: string;
}
export const getDatabaseTables = ({
  databaseList,
  selectedDb,
  tableSearch,
}: Args): RawDBTable[] => {
  return databaseList.reduce((acc, curr) => {
    if (curr.database.name === selectedDb) {
      if (tableSearch !== '') {
        return curr.tables.filter(
          (table) =>
            table.name.toUpperCase().search(tableSearch.toUpperCase()) >= 0
        );
      }
      return curr.tables;
    }
    return acc;
  }, [] as RawDBTable[]);
};

export const mapStoredToDefault = (
  rawTables: IntegrationRawTable[] | undefined
): RawTableFormInput => {
  if (!rawTables) {
    return {
      rawTable: '',
      selectedRawTables: [],
    };
  }
  if (rawTables.length === 0) {
    return {
      rawTable: RawTableOptions.NO,
      selectedRawTables: [],
    };
  }
  return {
    rawTable: RawTableOptions.YES,
    selectedRawTables: rawTables,
  };
};
