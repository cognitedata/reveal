import { useQuery } from '@tanstack/react-query';
import { getRawDBsAndTables } from 'utils/RawDataBaseAPI';
import { CogniteError, RawDB, RawDBTable } from '@cognite/sdk';
import { useSDK } from '@cognite/sdk-provider';

export type DatabaseWithTablesItem = {
  database: RawDB;
  tables: RawDBTable[];
};
export const useRawDBAndTables = () => {
  const sdk = useSDK();
  return useQuery<DatabaseWithTablesItem[], CogniteError>(
    ['raw-db-tables'],
    () => {
      return getRawDBsAndTables(sdk);
    },
    { staleTime: 10 * 60 * 1000, retry: 0 }
  );
};
