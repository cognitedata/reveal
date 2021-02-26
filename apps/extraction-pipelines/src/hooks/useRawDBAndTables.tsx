import { useQuery } from 'react-query';
import { SDKError } from '../model/SDKErrors';
import { getRawDBsAndTables } from '../utils/RawDataBaseAPI';
import { DatabaseWithTablesItem } from '../components/inputs/rawSelector/RawSelector';

export const useRawDBAndTables = () => {
  return useQuery<DatabaseWithTablesItem[], SDKError>('raw-db-tables', () => {
    return getRawDBsAndTables();
  });
};
