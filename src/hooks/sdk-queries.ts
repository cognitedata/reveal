import { useSDK } from '@cognite/sdk-provider';
import { RawDB, RawDBRow, RawDBRowInsert, RawDBTable } from '@cognite/sdk';
import { useInfiniteQuery, useMutation, useQueryClient } from 'react-query';
import { RAW_PAGE_SIZE_LIMIT } from 'utils/constants';
export const baseKey = 'raw-explorer';

export const dbKey = (db: string) => [baseKey, db];
export const databaseListKey = [baseKey, 'database-list'];
export const tableListKey = (db: string) => [...dbKey(db), 'table-list'];

export const tableKey = (db: string, table: string) => [baseKey, db, table];
export const rowKey = (db: string, table: string, pageSize?: number) => {
  const queryKey = [...tableKey(db, table), 'rows'];
  if (pageSize) {
    queryKey.push('pageSize');
    queryKey.push(String(pageSize));
  }
  return queryKey;
};

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
      sdk
        .get<{
          items: RawDBTable[];
          nextCursor: string | undefined;
        }>(
          `/api/v1/projects/${
            sdk.project
          }/raw/dbs/${database}/tables?limit=100${
            pageParam ? `&cursor=${pageParam}` : ''
          }`
        )
        .then((response) => response.data),
    {
      ...options,
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }
  );
};

export const useTableRows = (
  {
    database,
    table,
    pageSize = 100,
  }: {
    database: string;
    table: string;
    pageSize?: number;
  },
  options?: { enabled: boolean }
) => {
  const sdk = useSDK();

  const validatedPageSize =
    pageSize > RAW_PAGE_SIZE_LIMIT ? RAW_PAGE_SIZE_LIMIT : pageSize;

  return useInfiniteQuery(
    rowKey(database, table, validatedPageSize),
    ({ pageParam = undefined }) =>
      sdk
        .get<{
          items: RawDBRow[];
          nextCursor: string | undefined;
        }>(
          `/api/v1/projects/${
            sdk.project
          }/raw/dbs/${database}/tables/${table}/rows?limit=${validatedPageSize}${
            pageParam ? `&cursor=${pageParam}` : ''
          }`
        )
        .then((response) => ({
          ...response.data,
          items: response.data.items.map((r) => ({
            ...r,
            lastUpdatedTime: new Date(r.lastUpdatedTime),
          })),
        })),
    {
      ...options,
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }
  );
};

export const useDeleteDatabase = () => {
  const sdk = useSDK();
  const queryClient = useQueryClient();
  return useMutation(
    ({ database }: { database: string }) =>
      sdk.raw.deleteDatabases([{ name: database }]),
    {
      onSuccess(_, { database }) {
        queryClient.invalidateQueries(databaseListKey);
        queryClient.resetQueries(dbKey(database));
      },
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

export const useDeleteTable = () => {
  const sdk = useSDK();
  const queryClient = useQueryClient();
  return useMutation(
    ({ database, table }: { database: string; table: string }) =>
      sdk.raw.deleteTables(database, [{ name: table }]),
    {
      onSuccess(_, { database, table }) {
        queryClient.resetQueries(tableKey(database, table));
        queryClient.invalidateQueries(tableListKey(database));
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

export const useInsertRows = () => {
  const sdk = useSDK();

  return useMutation(
    ({
      database,
      table,
      items,
    }: {
      database: string;
      table: string;
      items: RawDBRowInsert[];
    }) => sdk.raw.insertRows(database, table, items)
  );
};
