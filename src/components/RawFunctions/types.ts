import { RawDB, RawDBTable } from '@cognite/sdk';

export type DatabaseWithTablesItem = {
  database: RawDB;
  tables: RawDBTable[];
};
