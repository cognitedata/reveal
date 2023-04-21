import { useFeatureToggle, useUpdateFeatureToggle } from './flag';

export const useGraphViewerFeatureFlag = () =>
  useFeatureToggle('DEVX_GRAPH_VIEWER');
export const useUpdateGraphViewerFeatureFlag = () =>
  useUpdateFeatureToggle('DEVX_GRAPH_VIEWER');
