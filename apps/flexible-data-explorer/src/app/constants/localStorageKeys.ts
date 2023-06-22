export const localStorageKeys = {
  dataModel: (project: string) => `selected-data-model-${project}`,
  recentlyVisited: () => 'recently-visited',
} as const;
