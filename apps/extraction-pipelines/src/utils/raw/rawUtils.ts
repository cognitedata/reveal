import { RawDBTable } from '@cognite/sdk';
import { DatabaseWithTablesItem } from '../../components/inputs/rawSelector/RawSelector';

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
