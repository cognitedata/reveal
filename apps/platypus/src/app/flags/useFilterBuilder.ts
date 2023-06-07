import { useFeatureToggle, useUpdateFeatureToggle } from './flag';

export const useFilterBuilderFeatureFlag = () =>
  useFeatureToggle('DEVX_FILTER_BUILDER');
export const useUpdateFilterBuilderFeatureFlag = () =>
  useUpdateFeatureToggle('DEVX_FILTER_BUILDER');
