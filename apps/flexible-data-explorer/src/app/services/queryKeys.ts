import { DocumentFilter, FileInfo } from '@cognite/sdk';

import { DataModel, Instance } from './types';

export const queryKeys = {
  all: ['fdx'] as const,

  listDataModels: () => [...queryKeys.all, 'dataModels', 'list'] as const,
  dataModelTypes: (dataModel?: DataModel) =>
    [...queryKeys.all, 'dataModels', 'types', dataModel] as const,

  searchDataTypes: (
    query: string,
    filter: Record<string, unknown>,
    dataModel?: DataModel
  ) =>
    [
      ...queryKeys.all,
      'dataTypes',
      'search',
      query,
      filter,
      dataModel,
    ] as const,

  instance: (instance: Instance, types: any, dataModel?: DataModel) =>
    [...queryKeys.all, 'instance', instance, types, dataModel] as const,
  instanceRelationship: (
    instance: Instance,
    dataModel: DataModel,
    type: string,
    filters: any
  ) =>
    [
      ...queryKeys.all,
      'instance-relationship',
      instance,
      dataModel,
      type,
      filters,
    ] as const,

  searchFiles: (query: string, filter?: DocumentFilter, limit?: number) => [
    ...queryKeys.all,
    'files',
    'search',
    query,
    filter,
    limit,
  ],

  fileContainer: (file?: FileInfo) => [...queryKeys.all, 'file', file] as const,
};
