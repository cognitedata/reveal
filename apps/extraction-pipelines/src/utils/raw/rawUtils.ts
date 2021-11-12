import { RawDBTable } from '@cognite/sdk';
import { ExtpipeRawTable } from 'model/Extpipe';
import { DatabaseWithTablesItem } from 'hooks/useRawDBAndTables';

export enum RawTableOptions {
  YES = 'Yes',
  NO = 'No',
}
export interface RawTableFormInput {
  rawTable: RawTableOptions | '';
  selectedRawTables: ExtpipeRawTable[];
}

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
        ) as RawDBTable[];
      }
      return [...curr.tables] as RawDBTable[];
    }
    return acc;
  }, [] as RawDBTable[]);
};

export const mapStoredToDefault = (
  rawTables: ExtpipeRawTable[] | undefined
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
