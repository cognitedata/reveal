export const queryKeys = {
  all: ['cdf'] as const,
  sequence: () => [...queryKeys.all, 'sequence'] as const,
  listSequence: (input?: any[]) =>
    [...queryKeys.sequence(), ...(input || [])] as const,
  timeseries: () => [...queryKeys.all, 'timeseries'] as const,
  listTimeseries: (input?: any[]) =>
    [...queryKeys.timeseries(), ...(input || [])] as const,
  events: () => [...queryKeys.all, 'events'] as const,
  listEvents: (input?: any[]) =>
    [...queryKeys.events(), ...(input || [])] as const,
  assets: () => [...queryKeys.all, 'assets'] as const,
  rootAsset: (assetId: number) =>
    [...queryKeys.assets(), assetId, 'rootParent'] as const,
  rootAssets: () => [...queryKeys.all, 'rootAssets'],
  assetChildren: (assetId: number) => [queryKeys.assets(), assetId, 'children'],
  listAssets: (input?: any[]) =>
    [...queryKeys.assets(), ...(input || [])] as const,
  retrieveAsset: (id: number) => [...queryKeys.assets(), 'asset', id] as const,
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
} as const;
