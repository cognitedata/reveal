export const queryKeys = {
  all: ['cdf'] as const,
  // EXTRACTOR MAPPINGS
  hostedExtractors: () => [...queryKeys.all, 'hostedextractors'] as const,
  extractorMappings: () =>
    [...queryKeys.hostedExtractors(), 'mappings'] as const,
} as const;
