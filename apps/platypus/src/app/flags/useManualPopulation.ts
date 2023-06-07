import { useFeatureToggle, useUpdateFeatureToggle } from './flag';

export const useManualPopulationFeatureFlag = () =>
  useFeatureToggle('DEVX_MANUAL_POPULATION');
export const useUpdateManualPopulationFeatureFlag = () =>
  useUpdateFeatureToggle('DEVX_MANUAL_POPULATION');
