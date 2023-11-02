import { DataModel, DataModelV2, Instance } from '@fdx/shared/types/services';

import { ModelRevisionToEdgeMap } from '@cognite/reveal-react-components/dist/components/NodeCacheProvider/types';
import { DocumentFilter, FileInfo } from '@cognite/sdk';

export const queryKeys = {
  all: ['fdx'] as const,

  listDataModels: () => [...queryKeys.all, 'dataModels', 'list'] as const,
  dataModelTypesV2: (dataModel?: DataModelV2) =>
    [...queryKeys.all, 'dataModels', 'types', dataModel] as const,
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
  aiSearchDataTypes: (
    query: string,
    dataModels: DataModelV2[],
    gql?: string,
    variables?: any
  ) =>
    [
      ...queryKeys.all,
      'ai',
      'search',
      query,
      dataModels,
      gql,
      variables,
    ] as const,
  searchAggregates: (
    query: string,
    filter: Record<string, unknown>,
    dataModel?: DataModel
  ) =>
    [
      ...queryKeys.all,
      'dataTypes',
      'search-aggregate',
      query,
      filter,
      dataModel,
    ] as const,
  searchAggregateValues: (
    dataType: string,
    field: string,
    query: string,
    filter: unknown
  ) =>
    [
      ...queryKeys.all,
      'dataTypes',
      'search-aggregate-values',
      dataType,
      field,
      query,
      filter,
    ] as const,
  searchAggregateValueByProperty: (
    dataType: string,
    field: string,
    query: string,
    property: string
  ) =>
    [
      ...queryKeys.all,
      'dataTypes',
      'search-aggregate-value-by-property',
      dataType,
      field,
      query,
      property,
    ] as const,
  searchMappedEquipmentInstances: (
    query: string,
    filter?: Record<string, unknown>
  ) =>
    [
      ...queryKeys.all,
      'mappedEquipmentInstances',
      'search',
      query,
      filter ?? {},
    ] as const,
  mappedEquipmentInstances: (
    mappedEquipment?: ModelRevisionToEdgeMap,
    filter?: Record<string, unknown>
  ) =>
    [
      ...queryKeys.all,
      'mappedEquipmentInstances',
      Array.from(mappedEquipment?.entries() ?? [], (pair) =>
        pair[1].map((edge) => edge.edge.externalId)
      )
        .flat()
        .sort(),
      filter,
    ] as const,

  instance: (instance: Instance, dataModel: Partial<DataModelV2>) =>
    [...queryKeys.all, 'instance', instance, dataModel] as const,
  instanceDirect: (
    instance: Instance,
    dataModel: Partial<DataModelV2>,
    types?: any
  ) =>
    [...queryKeys.all, 'instance-direct', instance, dataModel, types] as const,
  instanceRelationship: (
    instance: Instance,
    dataModel: Partial<DataModelV2>,
    entry: Record<string, unknown>,
    filters: any
  ) =>
    [
      ...queryKeys.all,
      'instance-relationship',
      instance,
      dataModel,
      entry,
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
  aggregateFiles: (query?: string, filter?: any, limit?: number) => [
    ...queryKeys.all,
    'files',
    'aggregate',
    query,
    filter,
    limit,
  ],
  fileContainer: (file?: FileInfo) => [...queryKeys.all, 'file', file] as const,

  timeseriesList: (filter?: any) => [
    ...queryKeys.all,
    'timeseries',
    'list',
    filter,
  ],
  aggregateTimeseries: (query: string, filter?: any) => [
    ...queryKeys.all,
    'timeseries',
    'aggregate',
    query,
    filter,
  ],
  timeseriesMetadataKeys: (query?: string) => [
    ...queryKeys.all,
    'timeseries',
    'metadata-keys',
    query,
  ],
};
