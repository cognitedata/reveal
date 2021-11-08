import { useQuery } from 'react-query';
import { SDKError } from 'model/SDKErrors';
import { getRawDBsAndTables } from 'utils/RawDataBaseAPI';
import { RawDB, RawDBTable } from '@cognite/cdf-sdk-singleton';

export type DatabaseWithTablesItem = {
  database: RawDB;
  tables: RawDBTable[];
};
export const useRawDBAndTables = () => {
  return useQuery<DatabaseWithTablesItem[], SDKError>('raw-db-tables', () => {
    return getRawDBsAndTables();
  });
};
