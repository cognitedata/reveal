import { useSDK } from '@cognite/sdk-provider'; // eslint-disable-line
import { RawDB, RawDBRow, RawDBRowInsert, RawDBTable } from '@cognite/sdk';
import { useInfiniteQuery, useMutation, useQueryClient } from 'react-query';

const baseKey = 'raw-explorer';

export const tableKey = (db: string) => [baseKey, db, 'tables'];
export const dbKey = [baseKey, 'databases'];
export const rowKey = (db: string, table: string, pageSize: number) => [
  baseKey,
  db,
  table,
  'rows',
  'pageSize',
  pageSize,
];

export const useDatabases = () => {
  const sdk = useSDK();
  return useInfiniteQuery(
    dbKey,
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
    }
  );
};

export const useTables = (
  { database }: { database: string },
  options?: { enabled: boolean }
) => {
  const sdk = useSDK();

  return useInfiniteQuery(
    tableKey(database),
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

type RowResponse = {
  items: RawDBRow[];
  nextCursor: string | undefined;
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

  return useInfiniteQuery(
    rowKey(database, table, pageSize),
    ({ pageParam = undefined }) =>
      sdk
        .get<{
          items: RawDBRow[];
          nextCursor: string | undefined;
        }>(
          `/api/v1/projects/${
            sdk.project
          }/raw/dbs/${database}/tables/${table}/rows?limit=${pageSize}${
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
      onSuccess() {
        queryClient.invalidateQueries(dbKey);
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
        queryClient.invalidateQueries(dbKey);
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
      onSuccess(_, { database }) {
        queryClient.invalidateQueries(tableKey(database));
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
        queryClient.invalidateQueries(tableKey(database));
      },
    }
  );
};

export const useInsertRows = () => {
  const sdk = useSDK();
  const queryClient = useQueryClient();

  return useMutation(
    ({
      database,
      table,
      items,
    }: {
      database: string;
      table: string;
      items: RawDBRowInsert[];
    }) => {
      return sdk.raw.insertRows(database, table, items);
    },
    {
      onSuccess(_, { database, table }) {
        queryClient.invalidateQueries(rowKey(database, table, 0).slice(0, 4));
      },
    }
  );
};
