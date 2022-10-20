export const queryKeys = {
  all: ['cdf'] as const,
  events: () => [...queryKeys.all, 'events'] as const,
  event: (filters?: any) => [...queryKeys.events(), filters] as const,
};
