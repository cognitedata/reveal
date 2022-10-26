export const queryKeys = {
  all: ['cdf'] as const,
  events: () => [...queryKeys.all, 'events'] as const,
  listEvents: (input?: any[]) =>
    [...queryKeys.events(), ...(input || [])] as const,
  assets: () => [...queryKeys.all, 'assets'] as const,
  listAssets: (input?: any[]) =>
    [...queryKeys.assets(), ...(input || [])] as const,
} as const;
