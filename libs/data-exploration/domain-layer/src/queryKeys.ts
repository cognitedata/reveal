import {
  DataSetFilter,
  DocumentSortItem,
  FileInfo,
  IdEither,
  LatestDataBeforeRequest,
} from '@cognite/sdk/dist/src';

export const queryKeys = {
  all: ['cdf'] as const,
  // SEQUENCE
  sequence: () => [...queryKeys.all, 'sequence'] as const,
  sequencesMetadata: (query?: string, advancedFilter?: any, filter?: any) =>
    [
      ...queryKeys.sequence(),
      'metadata',
      'keys',
      query || '',
      advancedFilter || {},
      filter || {},
    ] as const,
  listSequence: (input?: any[]) =>
    [...queryKeys.sequence(), ...(input || [])] as const,
  sequencesMetadataValues: (
    metadataKey: string,
    query?: string,
    advancedFilter?: any,
    filter?: any
  ) =>
    [
      ...queryKeys.sequence(),
      'metadata',
      'values',
      metadataKey,
      query || '',
      advancedFilter || {},
      filter || {},
    ] as const,
  aggregateSequence: (input?: any[]) =>
    [...queryKeys.sequence(), ...(input || []), 'aggregate'] as const,

  // TIMESERIES
  timeseries: () => [...queryKeys.all, 'timeseries'] as const,
  listTimeseries: (input?: any[]) =>
    [...queryKeys.timeseries(), ...(input || [])] as const,
  aggregateTimeseries: (input?: any[]) =>
    [...queryKeys.timeseries(), ...(input || []), 'aggregate'] as const,
  timeseriesMetadata: (query?: string, advancedFilter?: any, filter?: any) =>
    [
      ...queryKeys.timeseries(),
      'metadata',
      'keys',
      query || '',
      advancedFilter || {},
      filter || {},
    ] as const,
  timeseriesMetadataValues: (
    metadataKey: string,
    query?: string,
    advancedFilter?: any,
    filter?: any
  ) =>
    [
      ...queryKeys.timeseries(),
      'metadata',
      'values',
      metadataKey,
      query || '',
      advancedFilter || {},
      filter || {},
    ] as const,
  timeseriesUniqueValues: (
    property: string,
    query?: string,
    filter?: any,
    advancedFilter?: any
  ) =>
    [
      ...queryKeys.timeseries(),
      'unique-values',
      property,
      query || '',
      filter || {},
      advancedFilter || {},
    ] as const,

  timeseriesDatapoints: (items: IdEither[], filter?: any, limit?: number) =>
    [
      ...queryKeys.timeseries(),
      'datapoints',
      items,
      filter || {},
      limit,
    ] as const,
  timeseriesLatestDatapoints: (
    items: LatestDataBeforeRequest[],
    filter?: any
  ) =>
    [
      ...queryKeys.timeseries(),
      'latest',
      'datapoints',
      items,
      filter || {},
    ] as const,
  timeseriesById: (ids: IdEither[]) =>
    [...queryKeys.timeseries(), ids] as const,
  // EVENTS
  events: () => [...queryKeys.all, 'events'] as const,
  eventsMetadataValues: (
    metadataKey: string,
    query?: string,
    advancedFilter?: any,
    filter?: any
  ) =>
    [
      ...queryKeys.events(),
      'metadata',
      'values',
      metadataKey,
      query || '',
      advancedFilter || {},
      filter || {},
    ] as const,
  eventsUniqueValues: (
    property: string,
    filter?: any,
    advancedFilter?: any,
    query?: string
  ) =>
    [
      ...queryKeys.events(),
      'unique-values',
      property,
      filter || {},
      advancedFilter || {},
      query || '',
    ] as const,
  listEvents: (input?: any[]) =>
    [...queryKeys.events(), ...(input || [])] as const,
  aggregateEvents: (input?: any[]) =>
    [...queryKeys.events(), ...(input || []), 'aggregate'] as const,
  eventsMetadata: (query?: string, advancedFilter?: any, filter?: any) =>
    [
      ...queryKeys.events(),
      'metadata',
      'keys',
      query || '',
      advancedFilter || {},
      filter || {},
    ] as const,
  eventsByIds: (ids: IdEither[]) => [...queryKeys.events(), ids],

  // ASSETS
  assets: () => [...queryKeys.all, 'assets'] as const,
  assetByIds: (ids: IdEither[]) => [...queryKeys.assets(), ids],
  rootAsset: (assetId: number) =>
    [...queryKeys.assets(), assetId, 'rootParent'] as const,
  rootAssets: (rootAssetId?: number) => [
    ...queryKeys.all,
    'rootAssets',
    rootAssetId,
  ],
  assetChildren: (assetId: number) => [queryKeys.assets(), assetId, 'children'],
  listAssets: (input?: any[]) =>
    [...queryKeys.assets(), ...(input || [])] as const,
  aggregateAssets: (input?: any[]) =>
    [...queryKeys.assets(), ...(input || []), 'aggregate'] as const,
  retrieveAsset: (id: number) => [...queryKeys.assets(), 'asset', id] as const,
  assetsUniqueValues: (
    property: string,
    query?: string,
    advancedFilter?: any,
    searchQuery?: string,
    filter?: any
  ) =>
    [
      ...queryKeys.assets(),
      'unique-values',
      property,
      query || '',
      advancedFilter || {},
      searchQuery || '',
      filter || {},
    ] as const,
  assetsMetadata: (query?: string, advancedFilter?: any, filter?: any) =>
    [
      ...queryKeys.assets(),
      'metadata',
      'keys',
      query || '',
      advancedFilter || {},
      filter || {},
    ] as const,
  assetsMetadataValues: (
    metadataKey: string,
    query?: string,
    advancedFilter?: any,
    filter?: any
  ) =>
    [
      ...queryKeys.assets(),
      'metadata',
      'values',
      metadataKey,
      query || '',
      advancedFilter || {},
      filter || {},
    ] as const,
  listBasicAssetMappings: (id: number) =>
    [...queryKeys.retrieveAsset(id), 'basic-mappings'] as const,
  listDetailedAssetMappings: (id: number) =>
    [...queryKeys.retrieveAsset(id), 'detailed-mappings'] as const,
  retrieveThreeDModel: (id: number) =>
    [...queryKeys.all, '3d-model', id] as const,
  retrieveAssetReverseAnnotationLookup: (assetId: number) =>
    [...queryKeys.all, '3d-model', 'asset', assetId] as const,
  retrieveThreeDRevision: (modelId: number, revisionId: number) =>
    [
      ...queryKeys.retrieveThreeDModel(modelId),
      'revision',
      revisionId,
    ] as const,

  listDatasets: (filter?: DataSetFilter, limit?: number) =>
    [...queryKeys.all, 'datasets', filter, limit] as const,
  // DOCUMENTS
  documents: () => [...queryKeys.all, 'documents'] as const,
  documentsSearch: (
    filter?: any,
    localLimit?: number,
    sort?: DocumentSortItem[],
    options?: any
  ) =>
    [
      ...queryKeys.documents(),
      'search',
      filter || {},
      localLimit,
      sort,
      options || {},
    ] as const,
  documentsAggregate: () => [...queryKeys.documents(), 'aggregates'] as const,
  documentsAggregateCount: () =>
    [...queryKeys.documentsAggregate(), 'count'] as const,
  documentsAggregatesCountTotal: () =>
    [...queryKeys.documentsAggregateCount(), 'total'] as const,
  documentsAggregatesCountFiltered: (filters: any, query: string) =>
    [...queryKeys.documentsAggregateCount(), query, filters] as const,
  documentsTotalAggregates: (aggregate: any) =>
    [...queryKeys.documentsAggregate(), 'total', aggregate] as const,
  documentsFilteredAggregates: (filters: any, aggregates: any) =>
    [...queryKeys.documentsAggregate(), filters, aggregates] as const,

  documentsMetadata: (query?: string, filter?: any) =>
    [
      ...queryKeys.documents(),
      'metadata',
      'keys',
      query || '',
      filter || {},
    ] as const,
  documentsMetadataValues: (
    metadataKey: string,
    query?: string,
    filter?: any
  ) =>
    [
      ...queryKeys.documents(),
      'metadata',
      metadataKey,
      'values',
      query || '',
      filter || {},
    ] as const,

  documentsLabelValues: (filter?: any, query?: string) =>
    [...queryKeys.documents(), 'labels', filter || {}, query || ''] as const,
  documentsUniqueValues: (
    property: string | [string, string],
    filter?: any,
    query?: string
  ) =>
    [
      ...queryKeys.documents(),
      'unique-values',
      property,
      filter || {},
      query || '',
    ] as const,
  documentContainer: (file: any) =>
    [...queryKeys.documents(), 'container', file] as const,

  // FILE
  files: () => [...queryKeys.all, 'file'] as const,
  filePreviewURL: (fileId: number) => [
    ...queryKeys.files(),
    fileId,
    'previewURL',
  ],
  relatedFiles: (input?: any[]) =>
    [...queryKeys.files(), 'related-files', ...(input || [])] as const,

  // Relationships
  relationships: () => [...queryKeys.all, 'relationships'] as const,
  resourceRelationships: (
    resourceExternalIds: string[],
    relationshipResourceTypes: string[],
    filter: any = {}
  ) =>
    [
      ...queryKeys.relationships(),
      ...resourceExternalIds,
      ...relationshipResourceTypes,
      filter,
    ] as const,

  // Annotations
  annotations: () => [...queryKeys.all, 'annotations'] as const,
  fileAnnotations: (fileId: unknown) =>
    [...queryKeys.annotations(), 'file', fileId] as const,
  annotationsPagedFileReferences: (
    pagedFileReferences: { id: number; page: number | undefined }[]
  ) => [...queryKeys.annotations(), pagedFileReferences] as const,
  reverseLookupAnnotations: (filter: unknown) =>
    [...queryKeys.annotations(), 'reverseLookup', filter] as const,

  // Counts
  counts: () => [...queryKeys.all, 'counts'] as const,
  linkedResourcesCount: (
    resourceType: string,
    assetIds?: unknown[],
    linkedResourceIds?: unknown[]
  ) =>
    [
      ...queryKeys.counts(),
      'linked-resources',
      resourceType,
      ...(assetIds || []),
      ...(linkedResourceIds || []),
    ] as const,
  directlyLinkedResourcesCount: (resourceType: string, assetIds?: unknown[]) =>
    [
      ...queryKeys.counts(),
      'directly-linked-resources',
      resourceType,
      ...(assetIds || []),
    ] as const,
  assetIdsCount: (
    resourceType: string,
    resourceId: unknown,
    isDocumentsApiEnabled: boolean
  ) =>
    [
      ...queryKeys.counts(),
      'assets-ids',
      resourceType,
      resourceId,
      isDocumentsApiEnabled,
    ] as const,
  validResourcesCount: (resourceType: string, resourceIds: unknown[]) =>
    [
      ...queryKeys.counts(),
      'valid-resources-count',
      resourceType,
      ...(resourceIds || []),
    ] as const,

  labels: () => [...queryKeys.all, 'labels'] as const,
  allLabels: () => [...queryKeys.labels(), 'all'] as const,

  // Industry Canvas
  canvas: () => [...queryKeys.all, 'canvas'] as const,
  supportedResourceItem: (item: { id: number; type: string }) =>
    [...queryKeys.canvas(), item.type, item.id] as const,

  // 3D
  threeD: () => [...queryKeys.all, '3d'] as const,
  threeDModels: () => [...queryKeys.threeD(), 'models'] as const,
  listThreeDModels: (...input: any[]) => [
    ...queryKeys.threeDModels(),
    ...(input || []),
  ],
  listThreeDRevisions: (modelId?: number) =>
    [...queryKeys.threeDModels(), modelId, 'revisions'] as const,
  getThreeDRevisionOutputs: (modelId?: number, revisionId?: number) =>
    [...queryKeys.listThreeDRevisions(modelId), revisionId, 'outputs'] as const,
  get3DThumbnail: (url?: string) =>
    [...queryKeys.threeD(), 'thumbnail', url] as const,
  fileBySiteId: (siteId: string | undefined) =>
    [...queryKeys.files(), 'search', siteId] as const,
  fileIconQuery: (file: FileInfo | undefined) =>
    [...queryKeys.all, '360Image', 'icon', file?.id] as const,
  filesAggregateBySiteId: (siteId: string | undefined) =>
    [...queryKeys.files(), 'aggregate', siteId] as const,
  eventsBySiteId: (...input: any[]) => [
    ...queryKeys.listEvents(),
    ...(input || []),
  ],
  image360DataBySiteId: (siteId: string) => [
    ...queryKeys.threeD(),
    'image360',
    siteId,
  ],
} as const;
