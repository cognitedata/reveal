export const localStorageKeys = {
  dataModels: (project: string) => `selected-data-models-${project}`,
  dataModel: (project: string) => `selected-data-model-${project}`,
  recentlyVisited: () => 'recently-visited',
} as const;
