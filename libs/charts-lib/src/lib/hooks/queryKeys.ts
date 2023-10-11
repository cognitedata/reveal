export const queryKeys = {
  all: ['charts-firebase'] as const,
  publicCharts: (projectId: string) =>
    [...queryKeys.all, 'public', projectId] as const,
  userCharts: (projectId: string, userId: string, userEmail?: string) =>
    [...queryKeys.all, 'user', projectId, userId, userEmail] as const,
  fetchChart: (projectId: string, chartId: string) =>
    [...queryKeys.all, 'fetch-chart', projectId, chartId] as const,
  deleteChart: (projectId: string, chartId: string) => [
    [...queryKeys.all, 'delete-chart', projectId, chartId] as const,
  ],
};
