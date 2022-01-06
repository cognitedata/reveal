import { useQuery } from 'react-query';
import { SDKError } from 'model/SDKErrors';
import { getRawDBsAndTables } from 'utils/RawDataBaseAPI';
import { RawDB, RawDBTable } from '@cognite/sdk';
import { useSDK } from '@cognite/sdk-provider';

export type DatabaseWithTablesItem = {
  database: RawDB;
  tables: RawDBTable[];
};
export const useRawDBAndTables = () => {
  const sdk = useSDK();
  return useQuery<DatabaseWithTablesItem[], SDKError>(
    'raw-db-tables',
    () => {
      return getRawDBsAndTables(sdk);
    },
    { staleTime: 10 * 60 * 1000, retry: 0 }
  );
};
