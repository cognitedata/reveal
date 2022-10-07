import { useSDK } from '@cognite/sdk-provider';
import { RAW_DB_NAME, RAW_TABLE_NAME, TABLE_PAGE_SIZE } from 'common/constants';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { Flow } from 'types';

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

const getFlowListKey = () => ['flow-list'];
export function useFlowList() {
  const sdk = useSDK();
  return useQuery(getFlowListKey(), async () => {
    const rows = await sdk.raw
      .listRows(RAW_DB_NAME, RAW_TABLE_NAME, { limit: TABLE_PAGE_SIZE })
      .autoPagingToArray({ limit: -1 });
    return rows
      .map(
        (row): Flow => ({
          id: row.key,
          updated: row.lastUpdatedTime.getTime(),
          name: row.columns.name as string,
          description: row.columns.description as string | undefined,
          flow: row.columns.flow as any,
        })
      )
      .sort((a, b) => (b.updated || 0) - (a.updated || 0));
  });
}

export function useInsertFlow() {
  const sdk = useSDK();
  const qc = useQueryClient();
  return useMutation(
    ({ id, name, flow, description }: Flow) => {
      return sdk.raw.insertRows(RAW_DB_NAME, RAW_TABLE_NAME, [
        { key: id, columns: { name, flow, description } },
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
