import { DataModel, Instance } from './types';

export const queryKeys = {
  all: ['fdx'] as const,

  listDataModels: () => [...queryKeys.all, 'dataModels', 'list'] as const,
  dataModelTypes: (dataModel?: DataModel) =>
    [...queryKeys.all, 'dataModels', 'types', dataModel] as const,

  searchDataTypes: (query: string, dataModel?: DataModel) =>
    [...queryKeys.all, 'dataTypes', 'search', query, dataModel] as const,

  instance: (instance: Instance, dataModel?: DataModel) =>
    [...queryKeys.all, 'instance', instance, dataModel] as const,
};
