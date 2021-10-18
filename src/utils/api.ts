import { RawDB, RawDBTable } from '@cognite/sdk';

import sdk from 'utils/sdkSingleton';

import handleError from './handleError';

type DatabaseWithTablesItem = {
  database: RawDB;
  tables: RawDBTable[];
};

export const getDatabaseNames = async () => {
  try {
    const dbNames = await sdk.raw
      .listDatabases()
      .autoPagingToArray({ limit: -1 });
    return dbNames;
  } catch (error) {
    handleError(error);
    return [];
  }
};

export const getTablesForDatabase = async (db: RawDB) => {
  try {
    const tablesList = await sdk.raw
      .listTables(unescape(db.name))
      .autoPagingToArray({ limit: -1 });
    return { database: db, tables: tablesList };
  } catch (error) {
    handleError(error);
    return { database: db, tables: [] };
  }
};

export const getDatabasesWithTables = async () => {
  try {
    const databases = await getDatabaseNames();
    const list: DatabaseWithTablesItem[] = await Promise.all(
      databases.map(async (db) => getTablesForDatabase(db))
    );
    return list;
  } catch (e) {
    handleError(e);
    return [];
  }
};

export const createRawTable = async (
  database: string,
  newTableName: string
) => {
  try {
    const res = await sdk.raw.createTables(database, [{ name: newTableName }]);
    return res[0].name;
  } catch (e) {
    throw new Error(e);
  }
};

export const createRawDatabase = async (databaseName: string) => {
  try {
    const res = await sdk.raw.createDatabases([{ name: databaseName }]);
    return res[0].name;
  } catch (e) {
    throw new Error(e);
  }
};
