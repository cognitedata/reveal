import { useSDK } from '@cognite/sdk-provider';
import {
  RawDB,
  RawDBTable,
  RawDBRow,
  RawDBRowInsert,
  CogniteError,
} from '@cognite/sdk';
import {
  useInfiniteQuery,
  UseInfiniteQueryOptions,
  UseInfiniteQueryResult,
  useMutation,
  useQueryClient,
} from 'react-query';
import { RAW_PAGE_SIZE_LIMIT } from 'utils/constants';
import { useEffect } from 'react';
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

type RawDBPage = { items: RawDB[]; nextCursor?: string };
type RawTablePage = { items: RawDBTable[]; nextCursor?: string };
type RawDBRowPage = { items: RawDBRow[]; nextCursor?: string };

const useAll = <T, E>(
  q: (_?: UseInfiniteQueryOptions<T, E>) => UseInfiniteQueryResult<T, E>,
  o?: UseInfiniteQueryOptions<T, E>
) => {
  const r = q(o);
  useEffect(() => {
    if (r.hasNextPage && !r.isFetching && !r.error) {
      r.fetchNextPage();
    }
  }, [r]);
  return r;
};

export const useDatabases = (
  options?: UseInfiniteQueryOptions<RawDBPage, CogniteError>
) => {
  const sdk = useSDK();
  return useInfiniteQuery<RawDBPage, CogniteError>(
    databaseListKey,
    ({ pageParam = undefined }) =>
      sdk.raw.listDatabases({ cursor: pageParam, limit: 100 }),
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      ...options,
    }
  );
};
export const useAllDatabases = (
  options?: UseInfiniteQueryOptions<RawDBPage, CogniteError>
) => useAll(useDatabases, options);

export const useTables = (
  { database }: { database: string },
  options?: UseInfiniteQueryOptions<RawTablePage, CogniteError>
) => {
  const sdk = useSDK();

  return useInfiniteQuery<RawTablePage, CogniteError>(
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
export const useAllTables = (
  { database }: { database: string },
  options?: UseInfiniteQueryOptions<RawTablePage, CogniteError>
) => {
  const useTheseTables = (
    o?: UseInfiniteQueryOptions<RawTablePage, CogniteError>
  ) => useTables({ database }, o);
  return useAll(useTheseTables, options);
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
  options?: UseInfiniteQueryOptions<RawDBRowPage, CogniteError>
) => {
  const sdk = useSDK();

  const validatedPageSize =
    pageSize > RAW_PAGE_SIZE_LIMIT ? RAW_PAGE_SIZE_LIMIT : pageSize;

  return useInfiniteQuery<RawDBRowPage, CogniteError>(
    rowKey(database, table, validatedPageSize),
    ({ pageParam = undefined }) =>
      sdk.raw.listRows(database, table, {
        cursor: pageParam,
        limit: validatedPageSize,
      }),
    {
      ...options,
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }
  );
};

export const useDeleteDatabase = () => {
  const sdk = useSDK();
  const queryClient = useQueryClient();
  return useMutation<{}, CogniteError, { database: string }>(
    ({ database }) =>
      sdk.raw
        .deleteDatabases([{ name: database }])
        .catch((e) => Promise.reject(e.errors[0] || e)),
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
  return useMutation<RawDB, CogniteError, { name: string }>(
    ({ name }) =>
      sdk.raw
        .createDatabases([{ name }])
        .then((r) => r[0])
        .catch((e) => Promise.reject(e.errors[0] || e)),
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
  return useMutation<{}, CogniteError, { database: string; table: string }>(
    ({ database, table }) =>
      sdk.raw
        .deleteTables(database, [{ name: table }])
        .catch((e) => Promise.reject(e.errors[0] || e)),
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
  return useMutation<
    RawDBTable,
    CogniteError,
    { database: string; table: string }
  >(
    ({ database, table }) =>
      sdk.raw.createTables(database, [{ name: table }]).then((r) => r[0]),
    {
      onSuccess(_, { database }) {
        queryClient.invalidateQueries(tableListKey(database));
      },
    }
  );
};

export const useInsertRows = () => {
  const sdk = useSDK();

  return useMutation<
    {},
    CogniteError,
    {
      database: string;
      table: string;
      items: RawDBRowInsert[];
    }
  >(({ database, table, items }) => sdk.raw.insertRows(database, table, items));
};
