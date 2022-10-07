import { useSDK } from '@cognite/sdk-provider';
import { RawDBRow } from '@cognite/sdk/dist/src';
import { RAW_DB_NAME, RAW_TABLE_NAME, TABLE_PAGE_SIZE } from 'common/constants';
import {
  useMutation,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from 'react-query';
import { Canvas, Flow } from 'types';

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
