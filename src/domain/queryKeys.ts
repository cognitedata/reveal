export const queryKeys = {
  all: ['cdf'] as const,
  // SEQUENCE
  sequence: () => [...queryKeys.all, 'sequence'] as const,
  sequencesMetadata: () =>
    [...queryKeys.sequence(), 'metadata', 'keys'] as const,
  listSequence: (input?: any[]) =>
    [...queryKeys.sequence(), ...(input || [])] as const,
  aggregateSequence: (input?: any[]) =>
    [...queryKeys.sequence(), ...(input || []), 'aggregate'] as const,

  // TIMESERIES
  timeseries: () => [...queryKeys.all, 'timeseries'] as const,
  listTimeseries: (input?: any[]) =>
    [...queryKeys.timeseries(), ...(input || [])] as const,
  timeseriesMetadata: () =>
    [...queryKeys.timeseries(), 'metadata', 'keys'] as const,
  aggregateTimeseries: (input?: any[]) =>
    [...queryKeys.timeseries(), ...(input || []), 'aggregate'] as const,

  // EVENTS
  events: () => [...queryKeys.all, 'events'] as const,
  listEvents: (input?: any[]) =>
    [...queryKeys.events(), ...(input || [])] as const,
  aggregateEvents: (input?: any[]) =>
    [...queryKeys.events(), ...(input || []), 'aggregate'] as const,

  // ASSETS
  eventsMetadata: () => [...queryKeys.events(), 'metadata', 'keys'] as const,
  assets: () => [...queryKeys.all, 'assets'] as const,
  rootAsset: (assetId: number) =>
    [...queryKeys.assets(), assetId, 'rootParent'] as const,
  rootAssets: () => [...queryKeys.all, 'rootAssets'],
  assetChildren: (assetId: number) => [queryKeys.assets(), assetId, 'children'],
  listAssets: (input?: any[]) =>
    [...queryKeys.assets(), ...(input || [])] as const,
  aggregateAssets: (input?: any[]) =>
    [...queryKeys.assets(), ...(input || []), 'aggregate'] as const,
  retrieveAsset: (id: number) => [...queryKeys.assets(), 'asset', id] as const,
  assetsMetadata: () => [...queryKeys.assets(), 'metadata', 'keys'] as const,
  listBasicAssetMappings: (id: number) =>
    [...queryKeys.retrieveAsset(id), 'basic-mappings'] as const,
  listDetailedAssetMappings: (id: number) =>
    [...queryKeys.retrieveAsset(id), 'detailed-mappings'] as const,
  retrieveThreeDModel: (id: number) =>
    [...queryKeys.all, '3d-model', id] as const,
  retrieveThreeDRevision: (modelId: number, revisionId: number) =>
    [
      ...queryKeys.retrieveThreeDModel(modelId),
      'revision',
      revisionId,
    ] as const,

  // DOCUMENTS
  documents: () => [...queryKeys.all, 'documents'] as const,
  documentsAggregate: () => [...queryKeys.documents(), 'aggregates'] as const,
  documentsAggregateCount: () =>
    [...queryKeys.documentsAggregate(), 'count'] as const,
  documentsTotalAggregateCount: (aggregate?: any) =>
    [
      ...queryKeys.documentsAggregateCount(),
      'total',
      ...(aggregate || []),
    ] as const,
  documentsSearch: (filter?: any, localLimit?: number) =>
    [...queryKeys.documents(), 'search', filter, localLimit] as const,

  documentsFilterAggregateCount: (filters?: any) =>
    [...queryKeys.documentsAggregateCount(), filters] as const,
  documentsFilteredAggregates: (filters: any, aggregates: any) =>
    [...queryKeys.documentsAggregate(), filters, aggregates] as const,
  documentsMetadata: () =>
    [...queryKeys.documents(), 'metadata', 'keys'] as const,
} as const;
