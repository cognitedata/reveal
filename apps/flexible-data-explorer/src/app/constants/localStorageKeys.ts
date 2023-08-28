export const localStorageKeys = {
  dataModels: (project: string) => `selected-data-models-${project}`,
  aiResults: (project: string) => `recently-searched-ai-results-${project}`,
  recentlyVisited: (project: string) => `recently-visited-${project}`,
} as const;
