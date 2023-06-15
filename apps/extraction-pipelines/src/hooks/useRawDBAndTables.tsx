import { getRawDBsAndTables } from '@extraction-pipelines/utils/RawDataBaseAPI';
import { useQuery } from '@tanstack/react-query';

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
