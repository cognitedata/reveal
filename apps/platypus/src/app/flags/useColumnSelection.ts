import { useFeatureToggle, useUpdateFeatureToggle } from './flag';

export const useColumnSelectionFeatureFlag = () =>
  useFeatureToggle('DEVX_COLUMN_SELECTION');
export const useUpdateColumnSelectionFeatureFlag = () =>
  useUpdateFeatureToggle('DEVX_COLUMN_SELECTION');
