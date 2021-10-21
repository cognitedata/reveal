export const baseKey = 'data-sets';

export const listDataSetsKey = [baseKey, 'list'];

export const rawKey = 'raw';
export const rawDb = 'database';
export const rawTables = 'tables';

export const listRawDatabasesKey = [rawKey, 'list', rawDb];
export const listRawTablesKey = [rawKey, 'list', rawTables];

export const listGroupsKey = ['groups', 'list'];

export const getDataSetOwnersByIdKey = (id: string) => [baseKey, 'owners', id];
export const getRetrieveByDataSetIdKey = (id: string) => [baseKey, 'byId', id];
