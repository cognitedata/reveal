import { CogniteClient, ListResponse, RawDB, RawDBTable } from '@cognite/sdk';
import { DatabaseWithTablesItem } from 'hooks/useRawDBAndTables';

export const getRawDatabaseList = async (
  sdk: CogniteClient,
  limit: number = 500
): Promise<ListResponse<RawDB[]>> => {
  return sdk.raw.listDatabases({ limit });
};

export const getRawTableList = async (
  sdk: CogniteClient,
  dbName: string,
  args?: { limit: number }
): Promise<ListResponse<RawDBTable[]>> => {
  return sdk.raw.listTables(dbName, args);
};

const createPromises = (
  sdk: CogniteClient,
  res: ListResponse<RawDBTable[]>,
  limit: number
): Promise<DatabaseWithTablesItem>[] => {
  return res.items.map(async (db: RawDB) => {
    const tables = await getRawTableList(sdk, db.name, { limit });
    return { database: db, tables: tables.items };
  });
};

export const getRawDBsAndTables = async (
  sdk: CogniteClient,
  limit: number = 500
): Promise<DatabaseWithTablesItem[]> => {
  const res = await getRawDatabaseList(sdk, limit);
  const promises = createPromises(sdk, res, limit);
  const lastRes = await Promise.all(promises);
  return lastRes;
};
