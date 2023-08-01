export const localStorageKeys = {
  dataModels: (project: string) => `selected-data-models-${project}`,
  recentlyVisited: (project: string) => `recently-visited-${project}`,
} as const;
