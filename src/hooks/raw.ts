import { useSDK } from '@cognite/sdk-provider';
import { RAW_DB_NAME, RAW_TABLE_NAME, TABLE_PAGE_SIZE } from 'common/constants';
import { useMutation, useQuery, useQueryClient } from 'react-query';

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
  return useQuery(getFlowListKey(), () => {
    return sdk.raw
      .listRows(RAW_DB_NAME, RAW_TABLE_NAME, { limit: TABLE_PAGE_SIZE })
      .autoPagingToArray({ limit: -1 })
      .then((rows) =>
        rows.map((row) => ({
          id: row.key,
          updated: row.lastUpdatedTime,
          name: row.columns.name as string,
          flow: row.columns.flow as any,
        }))
      );
  });
}
type Flow = {
  id: string;
  name: string;
  flow: any;
};

export function useInsertFlow() {
  const sdk = useSDK();
  const qc = useQueryClient();
  return useMutation(
    ({ id, name, flow }: Flow) => {
      return sdk.raw.insertRows(RAW_DB_NAME, RAW_TABLE_NAME, [
        { key: id, columns: { name, flow } },
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
