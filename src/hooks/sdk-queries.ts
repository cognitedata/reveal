import { useSDK } from '@cognite/sdk-provider'; // eslint-disable-line
import { RawDB, RawDBRow, RawDBRowInsert, RawDBTable } from '@cognite/sdk';
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from 'react-query';
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
export const rawProfileKey = (db: string, table: string, limit?: number) => [
  baseKey,
  db,
  table,
  'raw-profile',
  { limit: limit || 'all' },
];

export const useDatabases = (options?: { enabled: boolean }) => {
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

export type StringProfile = {
  distinctCount: number;
  lengthHistogram: [number[], number[]];
  lengthRange: [number, number];
  valueCounts: [string[], number[]];
};
export type NumberProfile = {
  distinctCount: number;
  histogram: [number[], number[]];
  valueRange: [number, number];
};
export type BooleanProfile = {
  trueCount: number;
};
export type ObjectProfile = {
  keyCountRange: [number, number];
  keyCountHistogram: [number[], number[]];
};
export type VectorProfile = {
  lengthRange: [number, number];
  lengthHistogram: [number[], number[]];
};
export type Column = {
  count: number;
  nullCount: number;
  string: null | StringProfile;
  number: null | NumberProfile;
  boolean: null | BooleanProfile;
  object: null | ObjectProfile;
  vector: null | VectorProfile;
};
export type Profile = {
  rowCount: number;
  columns: Record<string, Column>;
};

export const useRawProfile = (
  {
    database,
    table,
    limit,
  }: {
    database: string;
    table: string;
    limit?: number;
  },
  options?: { enabled: boolean }
) => {
  const sdk = useSDK();
  return useQuery<Profile>(
    rawProfileKey(database, table, limit),
    () =>
      sdk
        .post(`/api/v1/projects/${sdk.project}/profiler/raw`, {
          data: {
            database,
            table,
            limit,
          },
        })
        .then((response) => response.data),
    options
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
