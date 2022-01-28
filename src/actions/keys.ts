export const baseKey = 'data-sets';

export const rawKey = 'raw';
export const rawDb = 'database';
export const rawTables = 'tables';

export const listRawDatabasesKey = [rawKey, 'list', rawDb];
export const listRawTablesKey = [rawKey, 'list', rawTables];

export const listGroupsKey = ['groups', 'list'];

export const getListDatasetsKey = (...rest: any[]) => [
  baseKey,
  'list',
  ...rest,
];

export const getListExtpipesKey = (...rest: any[]) => [
  baseKey,
  'extpipes',
  ...rest,
];

export const getDataSetOwnersByIdKey = (id: string, ...rest: any[]) => [
  baseKey,
  'owners',
  id,
  ...rest,
];
export const getRetrieveByDataSetIdKey = (id: string, ...rest: any[]) => [
  baseKey,
  'byId',
  id,
  ...rest,
];
