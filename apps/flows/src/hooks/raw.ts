import { BASE_QUERY_KEY } from '@flows/common/constants';
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';

import { RawDB } from '@cognite/sdk';
import { useSDK } from '@cognite/sdk-provider';

export const dbKey = (db: string) => [BASE_QUERY_KEY, db];
export const databaseListKey = [BASE_QUERY_KEY, 'database-list'];
export const tableListKey = (db: string) => [...dbKey(db), 'table-list'];

export const useDatabases = (options?: { enabled: boolean }) => {
  const sdk = useSDK();
  return useInfiniteQuery(
    databaseListKey,
    ({ pageParam = undefined }) =>
      sdk
        .get<{
          items: RawDB[];
          nextCursor: string | undefined;
        }>(
          `/api/v1/projects/${sdk.project}/raw/dbs?limit=100${
            pageParam ? `&cursor=${pageParam}` : ''
          }`
        )
        .then((response) => response.data),
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      ...options,
    }
  );
};

export const useTables = (
  { database }: { database: string },
  options?: { enabled: boolean }
) => {
  const sdk = useSDK();

  return useInfiniteQuery(
    tableListKey(database),
    ({ pageParam = undefined }) =>
      sdk.raw
        .listTables(database, { cursor: pageParam, limit: 100 })
        .then((response) => response),
    {
      ...options,
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }
  );
};

export const useCreateDatabase = () => {
  const sdk = useSDK();
  const queryClient = useQueryClient();
  return useMutation(
    ({ name }: { name: string }) => sdk.raw.createDatabases([{ name }]),
    {
      onSuccess() {
        queryClient.invalidateQueries(databaseListKey);
      },
    }
  );
};

export const useCreateTable = () => {
  const sdk = useSDK();
  const queryClient = useQueryClient();
  return useMutation(
    ({ database, table }: { database: string; table: string }) =>
      sdk.raw.createTables(database, [{ name: table }]),
    {
      onSuccess(_, { database }) {
        queryClient.invalidateQueries(tableListKey(database));
      },
    }
  );
};
