import { useSDK } from '@cognite/sdk-provider';
import { RawDBRow } from '@cognite/sdk/dist/src';
import { RAW_DB_NAME, RAW_TABLE_NAME, TABLE_PAGE_SIZE } from 'common/constants';
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from 'react-query';
import { Canvas, Flow } from 'types';
import { RawDB } from '@cognite/sdk';

export const BASE_KEY = 'flows';

export const dbKey = (db: string) => [BASE_KEY, db];
export const databaseListKey = [BASE_KEY, 'database-list'];
export const tableListKey = (db: string) => [...dbKey(db), 'table-list'];

const getCheckKey = () => ['raw-setup-check'];

export function useRawSetupCheck() {
  const sdk = useSDK();
  return useQuery(getCheckKey(), async () => {
    const dbCheck = sdk.raw
      .listDatabases({ limit: 1000 })
      .autoPagingToArray({ limit: -1 })
      .then((list) => !!list.find((db) => db.name === RAW_DB_NAME))
      .catch(() => false);
    const tableCheck = sdk.raw
      .listTables(RAW_DB_NAME, { limit: 1000 })
      .autoPagingToArray({ limit: -1 })
      .then((list) => !!list.find((table) => table.name === RAW_TABLE_NAME))
      .catch(() => false);
    return {
      hasDB: await dbCheck,
      hasTable: await tableCheck,
    };
  });
}

export function useCreateRawDB() {
  const sdk = useSDK();
  const qc = useQueryClient();
  return useMutation(() => sdk.raw.createDatabases([{ name: RAW_DB_NAME }]), {
    onSuccess() {
      qc.invalidateQueries(getCheckKey());
    },
  });
}

export function useCreateRawTable() {
  const sdk = useSDK();
  const qc = useQueryClient();
  return useMutation(
    () => sdk.raw.createTables(RAW_DB_NAME, [{ name: RAW_TABLE_NAME }]),
    {
      onSuccess() {
        qc.invalidateQueries(getCheckKey());
      },
    }
  );
}

const rowToFlow = (row: RawDBRow): Flow => ({
  id: row.key,
  updated: row.lastUpdatedTime.getTime(),
  name: row.columns.name as string,
  description: row.columns.description as string | undefined,
  canvas: row.columns.canvas as Canvas,
});

const getFlowListKey = () => ['flow-list'];
export function useFlowList(
  opts?: Omit<UseQueryOptions<Flow[], Error>, 'queryKey' | 'queryFn'>
) {
  const sdk = useSDK();
  return useQuery(
    getFlowListKey(),
    async () => {
      const rows = await sdk.raw
        .listRows(RAW_DB_NAME, RAW_TABLE_NAME, { limit: TABLE_PAGE_SIZE })
        .autoPagingToArray({ limit: -1 });
      return rows
        .map(rowToFlow)
        .sort((a, b) => (b.updated || 0) - (a.updated || 0));
    },
    opts
  );
}

const getFlowItemKey = (id: string) => ['flow', id];
export function useFlow(
  id: string,
  opts?: Omit<UseQueryOptions<Flow, Error>, 'queryKey' | 'queryFn'>
) {
  const sdk = useSDK();
  return useQuery(
    getFlowItemKey(id),
    async () => {
      const row = await sdk.raw.retrieveRow(RAW_DB_NAME, RAW_TABLE_NAME, id);
      return rowToFlow(row);
    },
    opts
  );
}

export function useInsertFlow() {
  const sdk = useSDK();
  const qc = useQueryClient();
  return useMutation(
    ({ id, name, canvas, description }: Flow) => {
      return sdk.raw.insertRows(RAW_DB_NAME, RAW_TABLE_NAME, [
        { key: id, columns: { name, canvas, description } },
      ]);
    },
    {
      onSuccess() {
        qc.invalidateQueries(getFlowListKey());
      },
    }
  );
}

export function useDeleteFlow() {
  const sdk = useSDK();
  const qc = useQueryClient();
  return useMutation(
    ({ id }: { id: string }) => {
      return sdk.raw.deleteRows(RAW_DB_NAME, RAW_TABLE_NAME, [{ key: id }]);
    },
    {
      onSuccess() {
        qc.invalidateQueries(getFlowListKey());
      },
    }
  );
}

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
