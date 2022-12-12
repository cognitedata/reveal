export const QueryKeys = {
  TOKEN: ['TOKEN'] as const,
  GROUPS: ['GROUPS'] as const,
  DATA_MODEL_LIST: ['DATA_MODEL_LIST'] as const,
  DATA_MODEL: (dataModelExternalId: string) =>
    ['DATA_MODEL', dataModelExternalId] as const,
  DATA_MODEL_VERSION_LIST: (dataModelExternalId: string) =>
    ['DATA_MODEL_VERSION_LIST', dataModelExternalId] as const,
  DATA_SETS_LIST: ['DATA_SETS_LIST'] as const,
  AUTHENTICATED_USER: ['AUTHENTICATED_USER'] as const,
  PUBLISHED_ROWS_COUNT_BY_TYPE: (
    datamodelId: string,
    dataModelTypeName: string
  ) =>
    ['PUBLISHED_ROWS_COUNT_BY_TYPE', datamodelId, dataModelTypeName] as const,
  TRANSFORMATION: (
    dataModelExternalId: string,
    type: string,
    version: string
  ) => ['TRANSFORMATION', dataModelExternalId, type, version] as const,
  PREVIEW_TABLE_DATA: (
    dataModelExternalId: string,
    type: string,
    version: string
  ) => ['PREVIEW_TABLE_DATA', dataModelExternalId, type, version] as const,
  PREVIEW_DATA: (
    dataModelExternalId: string,
    type: string,
    version: string,
    externalId: string
  ) =>
    ['PREVIEW_DATA', dataModelExternalId, type, version, externalId] as const,
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
};
