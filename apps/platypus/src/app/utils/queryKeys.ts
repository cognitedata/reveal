import { QueryFilter } from '@platypus/platypus-core';

export const QueryKeys = {
  LIST_DMS_SPACES: ['LIST_DMS_SPACES'] as const,
  TOKEN: ['TOKEN'] as const,
  GROUPS: ['GROUPS'] as const,
  DATA_MODEL_LIST: ['DATA_MODEL_LIST'] as const,
  DATA_MODEL: (space: string, dataModelExternalId: string) =>
    ['DATA_MODEL', space, dataModelExternalId] as const,
  DATA_MODEL_FROM_DMS: (
    space: string,
    dataModelExternalId: string,
    dataModelVersion: string
  ) =>
    [
      'DATA_MODEL_FROM_DMS',
      space,
      dataModelExternalId,
      dataModelVersion,
    ] as const,
  DATA_MODEL_VERSION_LIST: (space: string, dataModelExternalId: string) =>
    ['DATA_MODEL_VERSION_LIST', space, dataModelExternalId] as const,
  DATA_SETS_LIST: ['DATA_SETS_LIST'] as const,
  AUTHENTICATED_USER: ['AUTHENTICATED_USER'] as const,
  PUBLISHED_ROWS_COUNT_BY_TYPE: (
    space: string,
    datamodelId: string,
    dataModelTypeName: string
  ) =>
    [
      'PUBLISHED_ROWS_COUNT_BY_TYPE',
      space,
      datamodelId,
      dataModelTypeName,
    ] as const,
  FILTERED_ROWS_COUNT: (
    space: string,
    datamodelId: string,
    dataModelTypeName: string
  ) => ['FILTERED_ROWS_COUNT', space, datamodelId, dataModelTypeName] as const,
  TRANSFORMATION: (space: string, type: string, version: string) =>
    ['TRANSFORMATION', space, type, version] as const,
  PREVIEW_TABLE_DATA: (
    space: string,
    dataModelExternalId: string,
    type: string,
    version: string
  ) =>
    ['PREVIEW_TABLE_DATA', space, dataModelExternalId, type, version] as const,
  PREVIEW_DATA: (
    space: string,
    dataModelExternalId: string,
    type: string,
    version: string,
    externalId: string,
    nestedLimit: number,
    filters?: {
      [x: string]: QueryFilter;
    },
    limitFields?: string[]
  ) =>
    [
      'PREVIEW_DATA',
      space,
      dataModelExternalId,
      type,
      version,
      externalId,
      nestedLimit,
      filters,
      limitFields,
    ] as const,
  SUGGESTIONS_DATA: (
    selectedColumn: string,
    selectedSourceColumns: string[],
    selectedTargetColumns: string[]
  ) =>
    [
      'SUGGESTIONS_DATA',
      selectedColumn,
      selectedSourceColumns,
      selectedTargetColumns,
    ] as const,
  SPACES_LIST: ['SPACES_LIST'] as const,
};
