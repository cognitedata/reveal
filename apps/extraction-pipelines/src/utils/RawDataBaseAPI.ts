import { ListResponse } from '@cognite/sdk';
import { RawDB, RawDBTable, sdkv3 } from '@cognite/cdf-sdk-singleton';
import { DatabaseWithTablesItem } from 'components/inputs/rawSelector/RawSelector';

export const getRawDatabaseList = async (
  limit: number = 500
): Promise<ListResponse<RawDB[]>> => {
  return sdkv3.raw.listDatabases({ limit });
};

export const getRawTableList = async (
  dbName: string,
  args?: { limit: number }
): Promise<ListResponse<RawDBTable[]>> => {
  return sdkv3.raw.listTables(dbName, args);
};

const createPromises = (
  res: ListResponse<RawDBTable[]>,
  limit: number
): Promise<DatabaseWithTablesItem>[] => {
  return res.items.map(async (db: RawDB) => {
    const tables = await getRawTableList(db.name, { limit });
    return { database: db, tables: tables.items };
  });
};

export const getRawDBsAndTables = async (
  limit: number = 500
): Promise<DatabaseWithTablesItem[]> => {
  const res = await getRawDatabaseList(limit);
  const promises = createPromises(res, limit);
  const lastRes = await Promise.all(promises);
  return lastRes;
};
