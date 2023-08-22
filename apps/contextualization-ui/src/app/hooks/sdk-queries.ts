import { useEffect, useMemo, useRef } from 'react';

import {
  useInfiniteQuery,
  UseInfiniteQueryOptions,
  useQueries,
  useQueryClient,
} from '@tanstack/react-query';
import { isEqual } from 'lodash';

import { CogniteError, ListResponse, RawDB, RawDBTable } from '@cognite/sdk';
import { useSDK } from '@cognite/sdk-provider';

export const baseKey = 'raw-explorer';

const RAW_PAGE_SIZE_LIMIT = 10;

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

export const useDatabases = (
  options?: UseInfiniteQueryOptions<ListResponse<RawDB[]>, CogniteError>
) => {
  const sdk = useSDK();
  const query = useInfiniteQuery<ListResponse<RawDB[]>, CogniteError>(
    databaseListKey,
    ({ pageParam = undefined }) =>
      sdk.raw
        .listDatabases({ limit: 100, cursor: pageParam })
        .catch((e) => Promise.reject(e.errors?.[0] || e)),
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      ...options,
    }
  );

  useEffect(() => {
    if (query.hasNextPage && !query.isFetching) {
      query.fetchNextPage();
    }
  }, [query]);

  return query;
};

export const useTables = (
  { database }: { database: string },
  options?: UseInfiniteQueryOptions<ListResponse<RawDBTable[]>, CogniteError>
) => {
  const sdk = useSDK();

  const query = useInfiniteQuery<ListResponse<RawDBTable[]>, CogniteError>(
    tableListKey(database),
    ({ pageParam = undefined }) =>
      sdk.raw
        .listTables(database, { cursor: pageParam, limit: 100 })
        .catch((e) => Promise.reject(e.errors?.[0] || e)),
    {
      ...options,
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }
  );

  useEffect(() => {
    if (query.hasNextPage && !query.isFetching) {
      query.fetchNextPage();
    }
  }, [query]);

  return query;
};

type TablesGroupedByDatabases = {
  isFetching: boolean;
  isFetched: boolean;
  data: Record<string, string[]>;
};

export const useTablesGroupedByDatabases = (options?: { enabled: boolean }) => {
  const enabled = options?.enabled ?? true;
  const oldResult = useRef<TablesGroupedByDatabases>({
    isFetching: false,
    isFetched: false,
    data: {},
  });

  const queryClient = useQueryClient();

  const sdk = useSDK();
  const {
    data: dbData,
    isFetching: isFetchingDatabases,
    isFetched: didFetchDatabases,
  } = useDatabases({
    enabled,
    refetchOnWindowFocus: false,
  });

  const dbList = dbData?.pages[0].items.map((db) => db.name);
  const tableQueries = useQueries({
    queries: dbList
      ? dbList.map((dbName) => ({
          enabled: enabled && !isFetchingDatabases,
          queryKey: [...tableListKey(dbName), 1],
          queryFn: () =>
            sdk.raw
              .listTables(dbName)
              .autoPagingToArray({ limit: -1 })
              .then((response) => response?.map((table) => table.name)),
          refetchOnWindowFocus: false,
        }))
      : [],
  });
  const didFetchTables = tableQueries.every(({ isFetched }) => isFetched);
  const isFetchingTables = tableQueries.some(({ isFetching }) => isFetching);

  const tableData: Record<string, string[]> = useMemo(() => {
    return didFetchDatabases && didFetchTables
      ? dbList?.reduce((acc, db) => {
          const tableList: string[] =
            queryClient.getQueryData<string[]>([...tableListKey(db), 1]) ?? [];

          return {
            ...acc,
            [db]: tableList,
          };
        }, {} as Record<string, string[]>) ?? {}
      : {};
  }, [dbList, didFetchDatabases, didFetchTables, queryClient]);

  const result = {
    isFetching: isFetchingDatabases || isFetchingTables,
    isFetched: didFetchDatabases && didFetchTables,
    data: tableData,
  };

  if (isEqual(result, oldResult.current)) {
    return oldResult.current;
  }

  oldResult.current = result;
  return result;
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
      sdk.raw
        .listRows(database, table, {
          cursor: pageParam,
          limit: validatedPageSize,
        })
        .then((response) => ({
          ...response,
          items: response.items.map((r) => ({
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
